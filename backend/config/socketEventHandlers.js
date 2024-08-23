// messagingapp/backend/config/socketEventHandlers.js

const Message = require("../models/Message");
const Room = require("../models/Room");
const { saveMessage } = require("../controllers/messageController");
const logger = require("../utils/logger");

exports.attachHandlers = (io, socket) => {
  socket.on("joinRoom", handleJoinRoom(io, socket));
  socket.on("leaveRoom", handleLeaveRoom(io, socket));
  socket.on("chatMessage", handleChatMessage(io, socket));
  socket.on("editMessage", handleEditMessage(io, socket));
  socket.on("deleteMessage", handleDeleteMessage(io, socket));
  socket.on("typing", handleTyping(io, socket));
  socket.on("markMessageRead", handleMarkMessageRead(io, socket));
};

const handleJoinRoom = (io, socket) => async (roomId) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      logger.warn(`Room not found: ${roomId}`);
      return socket.emit("roomError", { error: "Room not found" });
    }

    if (room.isPrivate && !room.isMember(socket.user._id)) {
      logger.warn(`Unauthorized join attempt to private room: ${roomId}`);
      return socket.emit("roomError", {
        error: "You don't have permission to join this room",
      });
    }

    // Check if the user is already in the room
    if (socket.rooms.has(roomId)) {
      logger.info(
        `User ${socket.user.username} (${socket.id}) is already in room: ${room.name}`
      );
      return socket.emit("roomJoined", { roomId, name: room.name });
    }

    logger.info(
      `User ${socket.user.username} (${socket.id}) joining room: ${room.name}`
    );

    // Leave all other rooms except the socket's own room
    for (const r of socket.rooms) {
      if (r !== socket.id) {
        logger.info(
          `User ${socket.user.username} (${socket.id}) leaving room: ${r}`
        );
        socket.leave(r);
      }
    }

    socket.join(roomId);
    socket.emit("roomJoined", { roomId, name: room.name });

    // Emit userJoinedRoom event for all users, including the room creator
    io.to(roomId).emit("userJoinedRoom", {
      username: socket.user.username,
      roomId,
    });
  } catch (error) {
    logger.error(`Error joining room: ${error.message}`, { error });
    socket.emit("roomError", { error: "Failed to join room" });
  }
};

const handleLeaveRoom = (io, socket) => async (roomId) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      logger.warn(`Room not found: ${roomId}`);
      return socket.emit("roomError", { error: "Room not found" });
    }

    logger.info(
      `User ${socket.user.username} (${socket.id}) leaving room: ${room.name}`
    );
    socket.leave(roomId);
    socket.emit("roomLeft", { roomId, name: room.name });
    io.to(roomId).emit("userLeft", { username: socket.user.username });
  } catch (error) {
    logger.error(`Error leaving room: ${error.message}`, { error });
    socket.emit("roomError", { error: "Failed to leave room" });
  }
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

const handleTyping = (io, socket) => (data) => {
  const { room, isTyping } = data;
  logger.info(
    `User ${socket.user.username} is ${
      isTyping ? "typing" : "not typing"
    } in room ${room}`
  );
  socket.to(room).emit("userTyping", {
    username: socket.user.username,
    isTyping,
  });
};

const handleMarkMessageRead = (io, socket) => async (data) => {
  try {
    const { messageId } = data;
    const userId = socket.user._id;
    const username = socket.user.username;

    logger.info(
      `Marking message ${messageId} as read for user ${userId} (${username})`
    );

    const message = await Message.findById(messageId);
    if (message) {
      const wasNewlyMarked = await message.markAsRead(userId);
      if (wasNewlyMarked) {
        await message.populate("readBy.user", "username");
        io.to(message.room.toString()).emit("messageRead", {
          messageId,
          userId,
          username,
          readBy: message.readBy,
        });
        logger.info(
          `Message ${messageId} marked as read by user ${userId} (${username})`
        );
      } else {
        logger.info(
          `Message ${messageId} was already read by user ${userId} (${username})`
        );
      }
    } else {
      logger.warn(`Attempt to mark non-existent message as read: ${messageId}`);
    }
  } catch (error) {
    logger.error("Error marking message as read:", error);
    socket.emit("error", { message: "Failed to mark message as read" });
  }
};
