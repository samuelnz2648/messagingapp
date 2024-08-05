// messagingapp/backend/server.js

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const routes = require("./routes");
const configExpress = require("./config/express");
const configureSocketIO = require("./config/socketio");
const errorHandlers = require("./utils/errorHandlers");
const logger = require("./utils/logger");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Configure Express
configExpress(app);

// Connect to MongoDB
connectDB();

// Routes
app.use("/api", routes);

// 404 handler
app.use(errorHandlers.handle404);

// Global error handling middleware
app.use(errorHandlers.globalErrorHandler);

// Configure Socket.io
configureSocketIO(io);

// Handle unhandled promise rejections
errorHandlers.handleUnhandledRejection(server);

// Handle uncaught exceptions
errorHandlers.handleUncaughtException();

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

module.exports = app;
