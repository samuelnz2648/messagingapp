// messagingapp/backend/server.js

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

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error("Authentication error"));
    socket.userId = decoded.userId;
    next();
  });
});

// Socket.io
io.on("connection", (socket) => {
  console.log("New client connected", socket.userId);

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`User ${socket.userId} joined room: ${room}`);
  });

  socket.on("leaveRoom", (room) => {
    socket.leave(room);
    console.log(`User ${socket.userId} left room: ${room}`);
  });

  socket.on("chatMessage", async (data, tempMessageId) => {
    try {
      const savedMessage = await saveMessage({
        sender: socket.userId,
        room: data.room,
        content: data.content,
      });

      await savedMessage.populate("sender", "username");

      io.in(data.room).emit("message", savedMessage);
      socket.emit("messageConfirmation", savedMessage, tempMessageId);
    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("messageError", {
        tempMessageId,
        error: "Failed to save message",
      });
    }
  });

  socket.on("editMessage", async (data) => {
    try {
      const { messageId, content, room } = data;
      const message = await Message.findById(messageId);

      if (!message) {
        return socket.emit("messageError", { error: "Message not found" });
      }

      if (!message.isFromUser(socket.userId)) {
        return socket.emit("messageError", {
          error: "You can only edit your own messages",
        });
      }

      message.content = content;
      await message.save();

      const updatedMessage = await message.populate("sender", "username");
      io.in(room).emit("messageUpdated", updatedMessage);
    } catch (error) {
      console.error("Error editing message:", error);
      socket.emit("messageError", { error: "Failed to edit message" });
    }
  });

  socket.on("deleteMessage", async (data) => {
    try {
      const { messageId, room } = data;
      const message = await Message.findById(messageId);

      if (!message) {
        return socket.emit("messageError", { error: "Message not found" });
      }

      if (!message.isFromUser(socket.userId)) {
        return socket.emit("messageError", {
          error: "You can only delete your own messages",
        });
      }

      await message.remove();
      io.in(room).emit("messageDeleted", messageId);
    } catch (error) {
      console.error("Error deleting message:", error);
      socket.emit("messageError", { error: "Failed to delete message" });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.userId);
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
