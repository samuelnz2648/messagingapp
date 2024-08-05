// messagingapp/backend/config/socketUtils.js

const logger = require("../utils/logger");

exports.emitToRoom = (io, room, event, data) => {
  logger.info(`Emitting ${event} to room ${room}`);
  io.in(room).emit(event, data);
};

exports.emitError = (socket, errorMessage) => {
  logger.error(`Emitting error to socket ${socket.id}: ${errorMessage}`);
  socket.emit("messageError", { error: errorMessage });
};

exports.delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.isAuthorized = (message, userId) => {
  return message.sender.toString() === userId.toString();
};
