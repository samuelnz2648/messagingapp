// messagingapp/backend/routes/index.js

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const messageController = require("../controllers/messageController");
const auth = require("../middleware/auth");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/user", auth, userController.getUser);

// Protected routes
router.get("/messages/:room", auth, messageController.getMessages);

module.exports = router;
