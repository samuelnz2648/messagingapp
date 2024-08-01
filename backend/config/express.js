// messagingapp/backend/config/express.js

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
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

  app.use(cors());
  app.use(express.json());
  app.use(helmet());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
  });
  app.use("/api", limiter);

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
