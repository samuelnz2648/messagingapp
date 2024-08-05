// messagingapp/backend/routes/index.js

const express = require("express");
const router = express.Router();
const authRoutes = require("./authRoutes");
const messageRoutes = require("./messageRoutes");
const roomRoutes = require("./roomRoutes");
const logger = require("../utils/logger");

// Middleware to log access to main route groups
const logRouteAccess = (req, res, next) => {
  logger.info(`Main route accessed: ${req.method} ${req.baseUrl}${req.path}`);
  next();
};

router.use(logRouteAccess);

router.use("/auth", authRoutes);
router.use("/messages", messageRoutes);
router.use("/rooms", roomRoutes);

module.exports = router;
