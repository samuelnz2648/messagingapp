// messagingapp/backend/routes/index.js

const express = require("express");
const router = express.Router();
const authRoutes = require("./authRoutes");
const messageRoutes = require("./messageRoutes");

router.use("/auth", authRoutes);
router.use("/messages", messageRoutes);

module.exports = router;
