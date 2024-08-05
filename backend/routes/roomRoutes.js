// messagingapp/backend/routes/roomRoutes.js

const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const userController = require("../controllers/userController");
const logger = require("../utils/logger");

// Middleware to log route access
const logRouteAccess = (req, res, next) => {
  logger.info(`Room route accessed: ${req.method} ${req.originalUrl}`);
  next();
};

// Apply logging middleware to all routes
router.use(logRouteAccess);

// Protect all routes in this file
router.use(userController.protect);

// Create a new room
router.post("/", roomController.createRoom);

// Get all public rooms
router.get("/", roomController.getAllRooms);

// Get a specific room
router.get("/:id", roomController.getRoom);

// Join a room
router.post("/:id/join", roomController.joinRoom);

// Leave a room
router.post("/:id/leave", roomController.leaveRoom);

module.exports = router;
