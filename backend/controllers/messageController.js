// messagingapp/backend/controllers/messageController.js

const Message = require("../models/Message");

exports.saveMessage = async (messageData) => {
  try {
    const message = new Message(messageData);
    await message.save();
    return message.populate("sender", "username");
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { room } = req.params;
    const messages = await Message.find({ room })
      .populate("sender", "username")
      .sort("timestamp");
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
};
