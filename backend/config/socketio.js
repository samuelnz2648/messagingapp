// messagingapp/backend/config/socketio.js

const socketMiddleware = require("./socketMiddleware");
const socketEventHandlers = require("./socketEventHandlers");
const logger = require("../utils/logger");

module.exports = (io) => {
  const userSockets = new Map();

  // Apply authentication middleware
  io.use(socketMiddleware.authenticate);

  // Socket.io event handlers
  io.on("connection", (socket) => {
    logger.info(
      `New client connected: ${socket.id}, User: ${socket.user.username}`
    );
    userSockets.set(socket.id, socket.user);

    // Attach event handlers
    socketEventHandlers.attachHandlers(io, socket, userSockets);

    socket.on("disconnect", () => {
      logger.info(
        `Client disconnected: ${socket.id}, User: ${socket.user.username}`
      );
      userSockets.delete(socket.id);
    });
  });
};
