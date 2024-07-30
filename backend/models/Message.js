// messagingapp/backend/models/Message.js

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A message must have a sender"],
    },
    room: {
      type: String,
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for efficient querying
messageSchema.index({ room: 1, timestamp: -1 });

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
messageSchema.statics.getRecentMessages = function (room, limit = 50) {
  return this.find({ room })
    .sort("-timestamp")
    .limit(limit)
    .populate("sender", "username");
};

// Middleware to run before saving
messageSchema.pre("save", function (next) {
  if (this.isModified("content") && !this.isNew) {
    this.isEdited = true;
  }
  next();
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
