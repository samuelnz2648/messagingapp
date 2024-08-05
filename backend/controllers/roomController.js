// messagingapp/backend/controllers/roomController.js

const Room = require("../models/Room");
const AppError = require("../utils/errorHandlers");
const logger = require("../utils/logger");

exports.createRoom = async (req, res, next) => {
  try {
    const { name, description, isPrivate } = req.body;

    const newRoom = await Room.create({
      name,
      description,
      isPrivate,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    logger.info(`Room created: ${newRoom.name}`, {
      roomId: newRoom._id,
      userId: req.user._id,
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

module.exports = exports;
