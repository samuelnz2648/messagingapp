// messagingapp/backend/routes/messageRoutes.js

const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const userController = require("../controllers/userController");

// Protect all routes in this file
router.use(userController.protect);

// Get messages for a specific room
router.get("/:room", messageController.getMessages);

module.exports = router;
