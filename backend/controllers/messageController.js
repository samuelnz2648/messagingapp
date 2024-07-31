// messagingapp/backend/controllers/messageController.js

const Message = require("../models/Message");
const AppError = require("../utils/errorHandlers");
const morgan = require("morgan");

exports.saveMessage = async (messageData) => {
  try {
    const message = new Message(messageData);
    await message.save();
    return message.populate("sender", "username");
  } catch (error) {
    morgan(
      ":method :url :status :res[content-length] - :response-time ms Error saving message: :error",
      { error: error.message }
    );
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

    morgan(
      ":method :url :status :res[content-length] - :response-time ms Retrieved :count messages for room :room",
      { count: messages.length, room }
    );

    res.status(200).json({
      status: "success",
      results: messages.length,
      data: {
        messages,
      },
    });
  } catch (error) {
    morgan(
      ":method :url :status :res[content-length] - :response-time ms Error fetching messages: :error",
      { error: error.message }
    );
    next(new AppError("Error fetching messages", 500));
  }
};

module.exports = exports;
