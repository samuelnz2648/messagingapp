// messagingapp/backend/controllers/messageController.js

const Message = require("../models/Message");
const AppError = require("../utils/errorHandler");

exports.saveMessage = async (messageData) => {
  try {
    const message = new Message(messageData);
    await message.save();
    return message.populate("sender", "username");
  } catch (error) {
    console.error("Error saving message:", error);
    throw new AppError("Failed to save message", 500);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const { room } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    if (!room) {
      return next(new AppError("Room parameter is required", 400));
    }

    const messages = await Message.getRecentMessages(room, limit);

    res.status(200).json({
      status: "success",
      results: messages.length,
      data: {
        messages,
      },
    });
  } catch (error) {
    next(new AppError("Error fetching messages", 500));
  }
};

module.exports = exports;
