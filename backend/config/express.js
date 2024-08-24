// messagingapp/backend/config/express.js

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const logger = require("../utils/logger");

module.exports = (app) => {
  // Logging middleware
  app.use((req, res, next) => {
    res.on("finish", () => {
      logger.info(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${res.get(
          "Content-Length"
        )} - ${res.get("X-Response-Time")}ms`
      );
    });
    next();
  });

  // Enable CORS
  app.use(cors());

  // Parse JSON bodies
  app.use(express.json());

  // Set security HTTP headers
  app.use(helmet());

  // Log all errors
  app.use((err, req, res, next) => {
    logger.error(
      `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
        req.method
      } - ${req.ip}`
    );
    next(err);
  });
};
