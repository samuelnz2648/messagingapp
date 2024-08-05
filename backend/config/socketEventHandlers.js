// messagingapp/backend/config/socketEventHandlers.js

const Message = require("../models/Message");
const { saveMessage } = require("../controllers/messageController");
const logger = require("../utils/logger");

exports.attachHandlers = (io, socket, userSockets) => {
  socket.on("joinRoom", handleJoinRoom(socket));
  socket.on("chatMessage", handleChatMessage(io, socket));
  socket.on("editMessage", handleEditMessage(io, socket));
  socket.on("deleteMessage", handleDeleteMessage(io, socket));
};

const handleJoinRoom = (socket) => (room) => {
  logger.info(
    `User ${socket.user.username} (${socket.id}) joining room: ${room}`
  );
  socket.rooms.forEach((r) => {
    if (r !== socket.id) {
      logger.info(
        `User ${socket.user.username} (${socket.id}) leaving room: ${r}`
      );
      socket.leave(r);
    }
  });
  socket.join(room);
};

const handleChatMessage = (io, socket) => async (data) => {
  logger.info(
    `Received message from ${socket.user.username} (${socket.id}) in room ${data.room}: ${data.content}`
  );
  try {
    const savedMessage = await saveMessage({
      sender: socket.user._id,
      room: data.room,
      content: data.content,
    });

    await savedMessage.populate("sender", "username");

    logger.info(`Broadcasting message to room ${data.room}: ${savedMessage}`);
    io.in(data.room).emit("message", savedMessage);
  } catch (error) {
    logger.error("Error saving message:", error);
    socket.emit("messageError", {
      error: "Failed to save message",
    });
  }
};

const handleEditMessage = (io, socket) => async (data) => {
  logger.info(
    `Editing message: ${data.messageId} by ${socket.user.username} (${socket.id}) in room ${data.room}`
  );
  try {
    const { messageId, content, room } = data;
    const message = await Message.findById(messageId);

    if (!message) {
      logger.warn(`Message not found: ${messageId}`);
      return socket.emit("messageError", { error: "Message not found" });
    }

    if (message.sender.toString() !== socket.user._id.toString()) {
      logger.warn(
        `Unauthorized edit attempt by ${socket.user.username} (${socket.id})`
      );
      return socket.emit("messageError", {
        error: "You can only edit your own messages",
      });
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    const updatedMessage = await message.populate("sender", "username");
    logger.info(
      `Broadcasting updated message to room ${room}: ${updatedMessage}`
    );
    io.in(room).emit("messageUpdated", updatedMessage);
  } catch (error) {
    logger.error("Error editing message:", error);
    socket.emit("messageError", { error: "Failed to edit message" });
  }
};

const handleDeleteMessage = (io, socket) => async (data) => {
  logger.info(
    `Deleting message: ${data.messageId} by ${socket.user.username} (${socket.id}) in room ${data.room}`
  );
  try {
    const { messageId, room } = data;
    const message = await Message.findById(messageId);

    if (!message) {
      logger.warn(`Message not found: ${messageId}`);
      return socket.emit("messageError", { error: "Message not found" });
    }

    if (message.sender.toString() !== socket.user._id.toString()) {
      logger.warn(
        `Unauthorized delete attempt by ${socket.user.username} (${socket.id})`
      );
      return socket.emit("messageError", {
        error: "You can only delete your own messages",
      });
    }

    io.in(room).emit("messageDeleting", messageId);

    setTimeout(async () => {
      await Message.deleteOne({ _id: messageId });
      logger.info(`Message deleted: ${messageId}`);
      io.in(room).emit("messageDeleted", messageId);
    }, 300);
  } catch (error) {
    logger.error("Error deleting message:", error);
    socket.emit("messageError", { error: "Failed to delete message" });
  }
};
