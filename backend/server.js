// messagingapp/backend/server.js

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/database");
const routes = require("./routes");
const { saveMessage } = require("./controllers/messageController");
const User = require("./models/User");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api", routes);

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

      // Emit the message to all clients in the room including the sender
      io.in(data.room).emit("message", savedMessage);

      // Emit a confirmation to the sender with the tempMessageId
      socket.emit("messageConfirmation", savedMessage, tempMessageId);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.userId);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
