// messagingapp/backend/controllers/userController.js

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/errorHandlers");
const { promisify } = require("util");
const morgan = require("morgan");

const signToken = (id) => {
  return jwt.sign({ userId: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

exports.register = async (req, res, next) => {
  try {
    morgan(
      ":method :url :status :res[content-length] - :response-time ms Registration attempt received",
      { body: req.body }
    );
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      morgan(
        ":method :url :status :res[content-length] - :response-time ms User already exists",
        { user: existingUser }
      );
      return res.status(400).json({
        status: "fail",
        message: "User with this email or username already exists",
      });
    }

    const user = await User.create({ username, email, password });
    morgan(
      ":method :url :status :res[content-length] - :response-time ms New user created",
      { user: user.username }
    );

    user.password = undefined;

    const token = signToken(user._id);

    res.status(201).json({
      status: "success",
      token,
      data: { user },
    });
  } catch (error) {
    morgan(
      ":method :url :status :res[content-length] - :response-time ms Error in registration: :error",
      { error: error.message }
    );
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    morgan(
      ":method :url :status :res[content-length] - :response-time ms Login attempt received",
      { email: req.body.email }
    );
    const { email, password } = req.body;

    if (!email || !password) {
      morgan(
        ":method :url :status :res[content-length] - :response-time ms Missing email or password"
      );
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    morgan(
      ":method :url :status :res[content-length] - :response-time ms User found",
      { found: user ? "Yes" : "No" }
    );

    if (!user || !(await user.comparePassword(password))) {
      morgan(
        ":method :url :status :res[content-length] - :response-time ms Invalid email or password"
      );
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }

    const token = signToken(user._id);
    morgan(
      ":method :url :status :res[content-length] - :response-time ms Login successful",
      { user: user.email }
    );
    res.status(200).json({
      status: "success",
      token,
    });
  } catch (error) {
    morgan(
      ":method :url :status :res[content-length] - :response-time ms Error in login: :error",
      { error: error.message }
    );
    next(error);
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      morgan(
        ":method :url :status :res[content-length] - :response-time ms No token provided"
      );
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      morgan(
        ":method :url :status :res[content-length] - :response-time ms User not found for token"
      );
      return next(
        new AppError("The user belonging to this token no longer exists.", 401)
      );
    }

    req.user = currentUser;
    morgan(
      ":method :url :status :res[content-length] - :response-time ms User authenticated",
      { user: currentUser.email }
    );
    next();
  } catch (error) {
    morgan(
      ":method :url :status :res[content-length] - :response-time ms Error in authentication: :error",
      { error: error.message }
    );
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      morgan(
        ":method :url :status :res[content-length] - :response-time ms User not found"
      );
      return next(new AppError("User not found", 404));
    }
    morgan(
      ":method :url :status :res[content-length] - :response-time ms User fetched",
      { user: user.email }
    );
    res.json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    morgan(
      ":method :url :status :res[content-length] - :response-time ms Error fetching user: :error",
      { error: error.message }
    );
    next(error);
  }
};
