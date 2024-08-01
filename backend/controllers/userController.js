// messagingapp/backend/controllers/userController.js

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/errorHandlers");
const { promisify } = require("util");
const logger = require("../utils/logger");

const signToken = (id) => {
  return jwt.sign({ userId: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

exports.register = async (req, res, next) => {
  try {
    logger.info("Registration attempt received", {
      username: req.body.username,
      email: req.body.email,
    });
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      logger.warn("Registration attempt with existing username or email", {
        username,
        email,
      });
      return res.status(400).json({
        status: "fail",
        message: "User with this email or username already exists",
      });
    }

    const user = await User.create({ username, email, password });
    logger.info("New user created", {
      userId: user._id,
      username: user.username,
    });

    user.password = undefined;

    const token = signToken(user._id);

    res.status(201).json({
      status: "success",
      token,
      data: { user },
    });
  } catch (error) {
    logger.error("Error in registration", {
      error: error.message,
      stack: error.stack,
    });

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        status: "fail",
        message: messages.join(", "),
      });
    }

    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    logger.info("Login attempt received", { email: req.body.email });
    const { email, password } = req.body;

    if (!email || !password) {
      logger.warn("Login attempt with missing email or password");
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    logger.info("User found for login attempt", { found: !!user, email });

    if (!user || !(await user.comparePassword(password))) {
      logger.warn("Failed login attempt", { email });
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }

    const token = signToken(user._id);
    logger.info("Login successful", { userId: user._id, email: user.email });
    res.status(200).json({
      status: "success",
      token,
    });
  } catch (error) {
    logger.error("Error in login", {
      error: error.message,
      stack: error.stack,
    });
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
      logger.warn("Protected route accessed without token");
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      logger.warn("Protected route accessed with invalid token", {
        userId: decoded.userId,
      });
      return next(
        new AppError("The user belonging to this token no longer exists.", 401)
      );
    }

    req.user = currentUser;
    logger.info("User authenticated for protected route", {
      userId: currentUser._id,
      email: currentUser.email,
    });
    next();
  } catch (error) {
    logger.error("Error in authentication", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      logger.warn("User not found for getUser", { userId: req.user.id });
      return next(new AppError("User not found", 404));
    }
    logger.info("User fetched", { userId: user._id, email: user.email });
    res.json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    logger.error("Error fetching user", {
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });
    next(error);
  }
};
