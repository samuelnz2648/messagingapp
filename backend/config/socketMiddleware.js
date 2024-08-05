// messagingapp/backend/config/socketMiddleware.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");

exports.authenticate = async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("username");
    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }
    socket.user = user;
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    next(new Error(`Authentication error: ${error.message}`));
  }
};
