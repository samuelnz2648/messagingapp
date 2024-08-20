// messagingapp/backend/routes/messageRoutes.js

const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const userController = require("../controllers/userController");
const logger = require("../utils/logger");
const rateLimit = require("express-rate-limit");

// Middleware to log route access
const logRouteAccess = (req, res, next) => {
  logger.info(`Message route accessed: ${req.method} ${req.originalUrl}`);
  next();
};

// Rate limiter for message fetching
const messageLimiter = rateLimit({
  windowMs: 15 * 1000, // 15 seconds
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many requests, please try again later.",
  headers: true,
});

// Apply logging middleware to all routes
router.use(logRouteAccess);

// Protect all routes in this file
router.use(userController.protect);

// Get messages for a specific room
router.get("/:room", messageLimiter, (req, res, next) => {
  logger.info("Get messages attempt", {
    room: req.params.room,
    userId: req.user._id,
  });
  messageController.getMessages(req, res, next);
});

// Mark a message as read
router.post("/:messageId/read", messageController.markMessageAsRead);

module.exports = router;
