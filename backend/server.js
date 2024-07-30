const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const connectDB = require("./config/database");
const routes = require("./routes");
const { saveMessage } = require("./controllers/messageController");
const User = require("./models/User");
const Message = require("./models/Message");
const AppError = require("./utils/errorHandler");
const globalErrorHandler = require("./utils/errorHandler");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api", limiter);

// Connect to MongoDB
connectDB();

// Routes
app.use("/api", routes);

// 404 handler
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

// Store user information for each socket connection
const userSockets = new Map();

// Socket.io authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    console.log("Authentication error: No token provided");
    return next(new Error("Authentication error"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("username");
    if (!user) {
      console.log("Authentication error: User not found");
      return next(new Error("User not found"));
    }
    console.log("User authenticated:", user.username);
    socket.user = user;
    next();
  } catch (error) {
    console.log("Authentication error:", error.message);
    return next(new Error("Authentication error"));
  }
});

// Socket.io
io.on("connection", (socket) => {
  console.log(
    "New client connected:",
    socket.id,
    "User:",
    socket.user.username
  );
  userSockets.set(socket.id, socket.user);

  socket.on("joinRoom", (room) => {
    console.log(
      `User ${socket.user.username} (${socket.id}) joining room: ${room}`
    );
    // Leave all other rooms before joining the new one
    socket.rooms.forEach((r) => {
      if (r !== socket.id) {
        console.log(
          `User ${socket.user.username} (${socket.id}) leaving room: ${r}`
        );
        socket.leave(r);
      }
    });
    socket.join(room);
    console.log(
      `User ${socket.user.username} (${socket.id}) joined room: ${room}`
    );
  });

  socket.on("chatMessage", async (data) => {
    console.log(
      `Received message from ${socket.user.username} (${socket.id}) in room ${data.room}:`,
      data.content
    );
    try {
      const savedMessage = await saveMessage({
        sender: socket.user._id,
        room: data.room,
        content: data.content,
      });

      await savedMessage.populate("sender", "username");

      console.log(`Broadcasting message to room ${data.room}:`, savedMessage);
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
      await message.save();

      const updatedMessage = await message.populate("sender", "username");
      console.log(
        `Broadcasting updated message to room ${room}:`,
        updatedMessage
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

      await message.remove();
      console.log(
        `Broadcasting message deletion to room ${room}: ${messageId}`
      );
      io.in(room).emit("messageDeleted", messageId);
    } catch (error) {
      console.error("Error deleting message:", error);
      socket.emit("messageError", { error: "Failed to delete message" });
    }
  });

  socket.on("disconnect", () => {
    console.log(
      "Client disconnected:",
      socket.id,
      "User:",
      socket.user.username
    );
    userSockets.delete(socket.id);
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
