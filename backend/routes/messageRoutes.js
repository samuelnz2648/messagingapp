// messagingapp/backend/routes/messageRoutes.js

const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const userController = require("../controllers/userController");
const logger = require("../utils/logger");

// Middleware to log route access
const logRouteAccess = (req, res, next) => {
  logger.info(`Message route accessed: ${req.method} ${req.originalUrl}`);
  next();
};

// Apply logging middleware to all routes
router.use(logRouteAccess);

// Protect all routes in this file
router.use(userController.protect);

// Get messages for a specific room
router.get("/:room", (req, res, next) => {
  logger.info("Get messages attempt", {
    room: req.params.room,
    userId: req.user._id,
  });
  messageController.getMessages(req, res, next);
});

// Mark a message as read
router.post("/:messageId/read", messageController.markMessageAsRead);

module.exports = router;
