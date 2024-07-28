// messagingapp/frontend/src/components/Chat.js

import React, { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";

let socket;

function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [room, setRoom] = useState("general");
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const fetchMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5001/api/messages/${room}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [room]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    socket = io("http://localhost:5001", {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { token },
    });

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("joinRoom", room);
      fetchMessages();
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    fetchUsername();

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message");
      socket.disconnect();
    };
  }, [room, navigate, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchUsername = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5001/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsername(response.data.username);
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() && connected && !isSending) {
      setIsSending(true);
      const messageData = {
        userId: localStorage.getItem("userId"),
        room: room,
        content: inputMessage.trim(),
        username: username,
      };

      let tempMessageId = Date.now().toString();

      try {
        // Optimistically add the message to the UI
        const tempMessage = { ...messageData, _id: tempMessageId };
        setMessages((prevMessages) => [...prevMessages, tempMessage]);
        setInputMessage("");
        scrollToBottom();

        // Send the message to the server
        await socket.emit("chatMessage", messageData);

        // If successful, the server will broadcast the message back to all clients,
        // including the sender, so we don't need to update the state here again
      } catch (error) {
        console.error("Error sending message:", error);
        // Remove the temporary message if sending failed
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== tempMessageId)
        );
        alert("Failed to send message. Please try again.");
        setInputMessage(messageData.content); // Restore the unsent message to the input
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleRoomChange = (newRoom) => {
    socket.emit("leaveRoom", room);
    setRoom(newRoom);
    socket.emit("joinRoom", newRoom);
    setMessages([]);
    fetchMessages();
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat Room: {room}</h2>
        <div>
          <span>Logged in as: {username}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </div>
      <div className="room-selector">
        <button onClick={() => handleRoomChange("general")}>General</button>
        <button onClick={() => handleRoomChange("random")}>Random</button>
      </div>
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.username === username ? "own-message" : ""
            }`}
          >
            <strong>{msg.username}: </strong>
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={isSending}
        />
        <button type="submit" disabled={!connected || isSending}>
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>
      {!connected && (
        <div className="connection-status">
          Disconnected. Trying to reconnect...
        </div>
      )}
    </div>
  );
}

export default Chat;
