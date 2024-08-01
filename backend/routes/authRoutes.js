// messagingapp/backend/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const logger = require("../utils/logger");

// Middleware to log route access
const logRouteAccess = (req, res, next) => {
  logger.info(`Auth route accessed: ${req.method} ${req.originalUrl}`);
  next();
};

// Apply logging middleware to all routes
router.use(logRouteAccess);

router.post("/register", (req, res, next) => {
  logger.info("Registration attempt", { username: req.body.username });
  userController.register(req, res, next);
});

router.post("/login", (req, res, next) => {
  logger.info("Login attempt", { email: req.body.email });
  userController.login(req, res, next);
});

router.get("/user", userController.protect, (req, res, next) => {
  logger.info("Get user profile attempt", { userId: req.user._id });
  userController.getUser(req, res, next);
});

module.exports = router;
