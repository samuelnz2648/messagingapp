// messagingapp/backend/config/socketio.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");
const { saveMessage } = require("../controllers/messageController");

module.exports = (io) => {
  const userSockets = new Map();

  // Socket.io authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("username");
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }
      socket.user = user;
      next();
    } catch (error) {
      next(new Error(`Authentication error: ${error.message}`));
    }
  });

  // Socket.io event handlers
  io.on("connection", (socket) => {
    console.log(
      `New client connected: ${socket.id}, User: ${socket.user.username}`
    );
    userSockets.set(socket.id, socket.user);

    socket.on("joinRoom", (room) => {
      console.log(
        `User ${socket.user.username} (${socket.id}) joining room: ${room}`
      );
      socket.rooms.forEach((r) => {
        if (r !== socket.id) {
          console.log(
            `User ${socket.user.username} (${socket.id}) leaving room: ${r}`
          );
          socket.leave(r);
        }
      });
      socket.join(room);
    });

    socket.on("chatMessage", async (data) => {
      console.log(
        `Received message from ${socket.user.username} (${socket.id}) in room ${data.room}: ${data.content}`
      );
      try {
        const savedMessage = await saveMessage({
          sender: socket.user._id,
          room: data.room,
          content: data.content,
        });

        await savedMessage.populate("sender", "username");

        console.log(
          `Broadcasting message to room ${data.room}: ${savedMessage}`
        );
        io.in(data.room).emit("message", savedMessage);
      } catch (error) {
        console.error("Error saving message:", error);
        socket.emit("messageError", {
          error: "Failed to save message",
        });
      }
    });

    socket.on("editMessage", async (data) => {
      console.log(
        `Editing message: ${data.messageId} by ${socket.user.username} (${socket.id}) in room ${data.room}`
      );
      try {
        const { messageId, content, room } = data;
        const message = await Message.findById(messageId);

        if (!message) {
          console.log(`Message not found: ${messageId}`);
          return socket.emit("messageError", { error: "Message not found" });
        }

        if (message.sender.toString() !== socket.user._id.toString()) {
          console.log(
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
        console.log(
          `Broadcasting updated message to room ${room}: ${updatedMessage}`
        );
        io.in(room).emit("messageUpdated", updatedMessage);
      } catch (error) {
        console.error("Error editing message:", error);
        socket.emit("messageError", { error: "Failed to edit message" });
      }
    });

    socket.on("deleteMessage", async (data) => {
      console.log(
        `Deleting message: ${data.messageId} by ${socket.user.username} (${socket.id}) in room ${data.room}`
      );
      try {
        const { messageId, room } = data;
        const message = await Message.findById(messageId);

        if (!message) {
          console.log(`Message not found: ${messageId}`);
          return socket.emit("messageError", { error: "Message not found" });
        }

        if (message.sender.toString() !== socket.user._id.toString()) {
          console.log(
            `Unauthorized delete attempt by ${socket.user.username} (${socket.id})`
          );
          return socket.emit("messageError", {
            error: "You can only delete your own messages",
          });
        }

        await Message.deleteOne({ _id: messageId });
        console.log(`Message deleted: ${messageId}`);
        io.in(room).emit("messageDeleted", messageId);
      } catch (error) {
        console.error("Error deleting message:", error);
        socket.emit("messageError", { error: "Failed to delete message" });
      }
    });

    socket.on("disconnect", () => {
      console.log(
        `Client disconnected: ${socket.id}, User: ${socket.user.username}`
      );
      userSockets.delete(socket.id);
    });
  });
};
