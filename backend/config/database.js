// messagingapp/backend/config/database.js

const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info("MongoDB connected successfully");

    // Log when the connection is disconnected
    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    // Log when the connection is reconnected
    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected");
    });
  } catch (error) {
    logger.error("MongoDB connection error", { error: error.message });
    process.exit(1);
  }
};

module.exports = connectDB;
