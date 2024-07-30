// messagingapp/backend/controllers/userController.js

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/errorHandler");
const { promisify } = require("util");

const signToken = (id) => {
  return jwt.sign({ userId: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return next(
        new AppError("User with this email or username already exists", 400)
      );
    }

    const user = await User.create({ username, email, password });

    // Remove password from output
    user.password = undefined;

    const token = signToken(user._id);

    res.status(201).json({
      status: "success",
      token,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    // If everything ok, send token to client
    const token = signToken(user._id);
    res.json({
      status: "success",
      token,
    });
  } catch (error) {
    next(error);
  }
};

exports.protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return next(
        new AppError("The user belonging to this token no longer exists.", 401)
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    res.json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
