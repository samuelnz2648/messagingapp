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
    console.log("Registration attempt received:", req.body);
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log("User already exists:", existingUser);
      return res.status(400).json({
        status: "fail",
        message: "User with this email or username already exists",
      });
    }

    const user = await User.create({ username, email, password });
    console.log("New user created:", user);

    // Remove password from output
    user.password = undefined;

    const token = signToken(user._id);

    res.status(201).json({
      status: "success",
      token,
      data: { user },
    });
  } catch (error) {
    console.error("Error in registration:", error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    console.log("Login attempt received:", req.body);
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      console.log("Missing email or password");
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select("+password");
    console.log("User found:", user ? "Yes" : "No");

    if (!user || !(await user.comparePassword(password))) {
      console.log("Invalid email or password");
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }

    // If everything ok, send token to client
    const token = signToken(user._id);
    console.log("Login successful for user:", user.email);
    res.status(200).json({
      status: "success",
      token,
    });
  } catch (error) {
    console.error("Error in login:", error);
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
