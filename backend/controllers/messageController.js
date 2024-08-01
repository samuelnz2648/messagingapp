// messagingapp/backend/controllers/messageController.js

const Message = require("../models/Message");
const AppError = require("../utils/errorHandlers");
const logger = require("../utils/logger");

exports.saveMessage = async (messageData) => {
  try {
    const message = new Message(messageData);
    await message.save();
    logger.info(`Message saved successfully: ${message._id}`);
    return message.populate("sender", "username");
  } catch (error) {
    logger.error(`Error saving message: ${error.message}`, { error });
    throw new AppError("Failed to save message", 500);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const { room } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    if (!room) {
      logger.warn("Get messages attempt without room parameter");
      return next(new AppError("Room parameter is required", 400));
    }

    const messages = await Message.find({ room })
      .sort({ timestamp: 1 })
      .limit(limit)
      .populate("sender", "username");

    logger.info(`Retrieved ${messages.length} messages for room ${room}`);

    res.status(200).json({
      status: "success",
      results: messages.length,
      data: {
        messages,
      },
    });
  } catch (error) {
    logger.error(`Error fetching messages: ${error.message}`, {
      error,
      room: req.params.room,
      limit: req.query.limit,
    });
    next(new AppError("Error fetching messages", 500));
  }
};

module.exports = exports;
