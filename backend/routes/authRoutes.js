// messagingapp/backend/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/user", userController.protect, userController.getUser);

module.exports = router;
