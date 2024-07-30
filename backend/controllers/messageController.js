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

exports.createMessage = async (req, res, next) => {
  try {
    const { room, content } = req.body;

    if (!room || !content) {
      return next(new AppError("Room and content are required", 400));
    }

    const message = await Message.create({
      sender: req.user._id,
      room,
      content,
    });

    const populatedMessage = await message.populate("sender", "username");

    res.status(201).json({
      status: "success",
      data: {
        message: populatedMessage,
      },
    });
  } catch (error) {
    next(new AppError("Error creating message", 500));
  }
};

exports.updateMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return next(new AppError("Content is required for update", 400));
    }

    const message = await Message.findById(id);

    if (!message) {
      return next(new AppError("No message found with that ID", 404));
    }

    if (!message.isFromUser(req.user._id)) {
      return next(new AppError("You can only edit your own messages", 403));
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    const updatedMessage = await message.populate("sender", "username");

    res.status(200).json({
      status: "success",
      data: {
        message: updatedMessage,
      },
    });
  } catch (error) {
    next(new AppError("Error updating message", 500));
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return next(new AppError("No message found with that ID", 404));
    }

    if (!message.isFromUser(req.user._id)) {
      return next(new AppError("You can only delete your own messages", 403));
    }

    await message.remove();

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(new AppError("Error deleting message", 500));
  }
};

module.exports = exports;
