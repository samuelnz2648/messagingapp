// messagingapp/backend/routes/messageRoutes.js

const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const userController = require("../controllers/userController");

// Protect all routes in this file
router.use(userController.protect);

// Get messages for a specific room
router.get("/:room", messageController.getMessages);

// Create a new message
router.post("/", messageController.createMessage);

// Update a message
router.patch("/:id", messageController.updateMessage);

// Delete a message
router.delete("/:id", messageController.deleteMessage);

module.exports = router;
