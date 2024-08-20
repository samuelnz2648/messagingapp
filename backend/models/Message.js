// messagingapp/backend/models/Message.js

const mongoose = require("mongoose");
const logger = require("../utils/logger");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A message must have a sender"],
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "A message must belong to a room"],
    },
    content: {
      type: String,
      required: [true, "A message cannot be empty"],
      trim: true,
      maxlength: [500, "A message cannot be longer than 500 characters"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for efficient querying and sorting
messageSchema.index({ room: 1, timestamp: 1 });

// Virtual populate
messageSchema.virtual("senderInfo", {
  ref: "User",
  localField: "sender",
  foreignField: "_id",
  justOne: true,
});

// Instance method to check if the message is from a specific user
messageSchema.methods.isFromUser = function (userId) {
  return this.sender.toString() === userId.toString();
};

// Static method to get recent messages from a room
messageSchema.statics.getRecentMessages = async function (roomId, limit = 50) {
  const startTime = Date.now();
  try {
    const messages = await this.find({ room: roomId })
      .sort({ timestamp: -1 }) // Sort by timestamp in descending order
      .limit(limit)
      .populate("sender", "username")
      .populate("room", "name");

    const duration = Date.now() - startTime;
    logger.info(
      `Retrieved ${messages.length} messages for room ${roomId} in ${duration}ms`
    );

    return messages;
  } catch (error) {
    logger.error(`Error retrieving messages for room ${roomId}`, {
      error: error.message,
      duration: Date.now() - startTime,
    });
    throw error;
  }
};

// Middleware to run before saving
messageSchema.pre("save", function (next) {
  if (this.isModified("content") && !this.isNew) {
    this.isEdited = true;
    logger.info(`Message edited: ${this._id}`);
  }
  next();
});

messageSchema.methods.markAsRead = async function (userId) {
  if (!this.readBy.some((read) => read.user.toString() === userId.toString())) {
    this.readBy.push({ user: userId });
    await this.save();
    logger.info(`Message ${this._id} marked as read by user ${userId}`);
    return true; // Indicate that the message was newly marked as read
  }
  return false; // Indicate that the message was already read by this user
};

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
