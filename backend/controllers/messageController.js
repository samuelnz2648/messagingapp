// messagingapp/backend/controllers/messageController.js

const Message = require("../models/Message");
const AppError = require("../utils/errorHandlers");
const logger = require("../utils/logger");

exports.saveMessage = async (messageData) => {
  try {
    const message = new Message(messageData);
    await message.save();
    logger.info(`Message saved successfully: ${message._id}`, {
      messageContent: message.content,
      sender: message.sender,
      room: message.room,
    });
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
      .populate("sender", "username")
      .populate("readBy.user", "username");

    // Remove duplicate read receipts
    messages.forEach((message) => {
      message.readBy = message.readBy.filter(
        (v, i, a) =>
          a.findIndex(
            (t) => t.user._id.toString() === v.user._id.toString()
          ) === i
      );
    });

    logger.info(`Retrieved ${messages.length} messages for room ${room}`, {
      messageIds: messages.map((m) => m._id.toString()),
    });

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

exports.markMessageAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      logger.warn(`Attempt to mark non-existent message as read: ${messageId}`);
      return next(new AppError("Message not found", 404));
    }

    const wasNewlyMarked = await message.markAsRead(userId);
    if (wasNewlyMarked) {
      // Emit a socket event to notify other users only if it was newly marked
      const io = req.app.get("io");
      io.to(message.room.toString()).emit("messageRead", { messageId, userId });
    }

    logger.info(`Message ${messageId} marked as read by user ${userId}`);

    res.status(200).json({
      status: "success",
      data: {
        message: "Message marked as read",
      },
    });
  } catch (error) {
    logger.error(`Error marking message as read: ${error.message}`, { error });
    next(new AppError("Error marking message as read", 500));
  }
};

module.exports = exports;
