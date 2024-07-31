// messagingapp/backend/config/database.js

const mongoose = require("mongoose");
const morgan = require("morgan");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    morgan(
      ":method :url :status :res[content-length] - :response-time ms MongoDB connected successfully"
    );
  } catch (error) {
    morgan(
      ":method :url :status :res[content-length] - :response-time ms MongoDB connection error: :error",
      { error: error.message }
    );
    process.exit(1);
  }
};

module.exports = connectDB;
