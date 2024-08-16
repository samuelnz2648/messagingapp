// messagingapp/backend/controllers/roomController.js

const Room = require("../models/Room");
const User = require("../models/User");
const { AppError } = require("../utils/errorHandlers"); // Ensure AppError is imported correctly
const logger = require("../utils/logger");

exports.createRoom = async (req, res, next) => {
  try {
    const { name, description, isPrivate, members } = req.body;

    // Validate members if it's a private room
    if (
      isPrivate &&
      (!members || !Array.isArray(members) || members.length === 0)
    ) {
      return next(
        new AppError("Private rooms must have at least one member", 400)
      );
    }

    // Create the room
    const newRoom = await Room.create({
      name,
      description,
      isPrivate,
      createdBy: req.user._id,
      members: isPrivate ? [req.user._id, ...members] : [req.user._id],
    });

    // If it's a private room, add all members to the room
    if (isPrivate) {
      await User.updateMany(
        { _id: { $in: members } },
        { $addToSet: { rooms: newRoom._id } }
      );
    }

    // Populate the createdBy field
    await newRoom.populate("createdBy", "username");

    // Emit a socket event for both public and private rooms
    const io = req.app.get("io");
    if (io) {
      const roomData = {
        room: newRoom,
        isPrivate: newRoom.isPrivate,
        createdBy: req.user.username,
      };

      if (newRoom.isPrivate) {
        // For private rooms, emit only to room members
        newRoom.members.forEach((memberId) => {
          io.to(memberId.toString()).emit("newRoom", roomData);
        });
        // Log the emission for debugging
        logger.info(
          `Emitted newRoom event for private room ${
            newRoom._id
          } to members: ${newRoom.members.join(", ")}`
        );
      } else {
        // For public rooms, emit to all connected clients
        io.emit("newRoom", roomData);
        logger.info(
          `Emitted newRoom event for public room ${newRoom._id} to all clients`
        );
      }
    } else {
      logger.warn("Socket.io instance not found when creating a room");
    }

    logger.info(`Room created: ${newRoom.name}`, {
      roomId: newRoom._id,
      userId: req.user._id,
      isPrivate: newRoom.isPrivate,
    });

    res.status(201).json({
      status: "success",
      data: {
        room: newRoom,
      },
    });
  } catch (error) {
    logger.error(`Error creating room: ${error.message}`, { error });
    next(new AppError("Failed to create room", 500));
  }
};

exports.getAllRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ isPrivate: false }).populate(
      "createdBy",
      "username"
    );

    logger.info(`Retrieved ${rooms.length} public rooms`);

    res.status(200).json({
      status: "success",
      results: rooms.length,
      data: {
        rooms,
      },
    });
  } catch (error) {
    logger.error(`Error fetching rooms: ${error.message}`, { error });
    next(new AppError("Error fetching rooms", 500));
  }
};

exports.getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate(
      "createdBy",
      "username"
    );

    if (!room) {
      logger.warn(`Room not found: ${req.params.id}`);
      return next(new AppError("Room not found", 404));
    }

    if (room.isPrivate && !room.isMember(req.user._id)) {
      logger.warn(
        `Unauthorized access attempt to private room: ${req.params.id}`,
        { userId: req.user._id }
      );
      return next(
        new AppError("You do not have permission to access this room", 403)
      );
    }

    logger.info(`Room retrieved: ${room.name}`, {
      roomId: room._id,
      userId: req.user._id,
    });

    res.status(200).json({
      status: "success",
      data: {
        room,
      },
    });
  } catch (error) {
    logger.error(`Error fetching room: ${error.message}`, {
      error,
      roomId: req.params.id,
    });
    next(new AppError("Error fetching room", 500));
  }
};

exports.joinRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      logger.warn(`Room not found for joining: ${req.params.id}`);
      return next(new AppError("Room not found", 404));
    }

    if (room.isPrivate) {
      logger.warn(`Attempt to join private room: ${req.params.id}`, {
        userId: req.user._id,
      });
      return next(new AppError("Cannot join a private room", 403));
    }

    if (room.members.includes(req.user._id)) {
      logger.info(`User already a member of room: ${room.name}`, {
        roomId: room._id,
        userId: req.user._id,
      });
      return res.status(200).json({
        status: "success",
        message: "You are already a member of this room",
      });
    }

    room.members.push(req.user._id);
    await room.save();

    logger.info(`User joined room: ${room.name}`, {
      roomId: room._id,
      userId: req.user._id,
    });

    res.status(200).json({
      status: "success",
      message: "Successfully joined the room",
      data: {
        room,
      },
    });
  } catch (error) {
    logger.error(`Error joining room: ${error.message}`, {
      error,
      roomId: req.params.id,
      userId: req.user._id,
    });
    next(new AppError("Error joining room", 500));
  }
};

exports.leaveRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      logger.warn(`Room not found for leaving: ${req.params.id}`);
      return next(new AppError("Room not found", 404));
    }

    if (!room.members.includes(req.user._id)) {
      logger.warn(`User not a member of room: ${room.name}`, {
        roomId: room._id,
        userId: req.user._id,
      });
      return next(new AppError("You are not a member of this room", 400));
    }

    room.members = room.members.filter(
      (memberId) => memberId.toString() !== req.user._id.toString()
    );
    await room.save();

    logger.info(`User left room: ${room.name}`, {
      roomId: room._id,
      userId: req.user._id,
    });

    res.status(200).json({
      status: "success",
      message: "Successfully left the room",
    });
  } catch (error) {
    logger.error(`Error leaving room: ${error.message}`, {
      error,
      roomId: req.params.id,
      userId: req.user._id,
    });
    next(new AppError("Error leaving room", 500));
  }
};

exports.getAllRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({
      $or: [{ isPrivate: false }, { members: req.user._id }],
    }).populate("createdBy", "username");

    logger.info(`Retrieved ${rooms.length} rooms for user ${req.user._id}`);

    res.status(200).json({
      status: "success",
      results: rooms.length,
      data: {
        rooms,
      },
    });
  } catch (error) {
    logger.error(`Error fetching rooms: ${error.message}`, { error });
    next(new AppError("Error fetching rooms", 500));
  }
};

module.exports = exports;
