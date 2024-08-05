// messagingapp/backend/models/Room.js

const mongoose = require("mongoose");
const logger = require("../utils/logger");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A room must have a name"],
      unique: true,
      trim: true,
      minlength: [3, "Room name must be at least 3 characters long"],
      maxlength: [30, "Room name cannot exceed 30 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Room description cannot exceed 200 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A room must have a creator"],
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for efficient querying
roomSchema.index({ name: 1, createdBy: 1 });

// Virtual populate
roomSchema.virtual("memberCount").get(function () {
  return this.members.length;
});

// Instance method to check if a user is a member of the room
roomSchema.methods.isMember = function (userId) {
  return this.members.some((member) => member.toString() === userId.toString());
};

// Static method to get rooms for a user
roomSchema.statics.getRoomsForUser = async function (userId) {
  const startTime = Date.now();
  try {
    const rooms = await this.find({ members: userId })
      .populate("createdBy", "username")
      .select("name description isPrivate createdAt");

    const duration = Date.now() - startTime;
    logger.info(
      `Retrieved ${rooms.length} rooms for user ${userId} in ${duration}ms`
    );

    return rooms;
  } catch (error) {
    logger.error(`Error retrieving rooms for user ${userId}`, {
      error: error.message,
      duration: Date.now() - startTime,
    });
    throw error;
  }
};

// Middleware to run before saving
roomSchema.pre("save", function (next) {
  if (this.isNew) {
    logger.info(`New room created: ${this.name}`);
  }
  next();
});

// Middleware to run after saving
roomSchema.post("save", function (doc, next) {
  logger.info(`Room saved: ${doc.name}`, {
    roomId: doc._id,
    createdBy: doc.createdBy,
    isPrivate: doc.isPrivate,
  });
  next();
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
