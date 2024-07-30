// messagingapp/frontend/src/components/Chat.js

import React, { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ChatContainer,
  ChatHeader,
  RoomSelector,
  RoomButton,
  MessagesContainer,
  Message,
  MessageForm,
  MessageInput,
  SendButton,
  ConnectionStatus,
  LogoutButton,
  EditButton,
  DeleteButton,
} from "../styles/ChatStyles";

let socket;

function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [room, setRoom] = useState("general");
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
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
      setMessages(response.data.data.messages);
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

    socket.on("messageUpdated", (updatedMessage) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      );
    });

    socket.on("messageDeleted", (deletedMessageId) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== deletedMessageId)
      );
    });

    fetchUsername();

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message");
      socket.off("messageUpdated");
      socket.off("messageDeleted");
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
      const response = await axios.get("http://localhost:5001/api/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsername(response.data.data.user.username);
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() && connected && !isSending) {
      setIsSending(true);

      try {
        if (editingMessageId) {
          await socket.emit("editMessage", {
            messageId: editingMessageId,
            content: inputMessage.trim(),
            room,
          });
          setEditingMessageId(null);
        } else {
          await socket.emit("chatMessage", {
            room: room,
            content: inputMessage.trim(),
          });
        }
        setInputMessage("");
        scrollToBottom();
      } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message. Please try again.");
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

  const startEditMessage = (messageId, content) => {
    setEditingMessageId(messageId);
    setInputMessage(content);
  };

  const deleteMessage = async (messageId) => {
    try {
      await socket.emit("deleteMessage", { messageId, room });
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message. Please try again.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUsername("");
    setMessages([]);
    navigate("/login");
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <h2 className="text-xl font-bold">Chat Room: {room}</h2>
        <div className="flex items-center space-x-4">
          <span>Logged in as: {username}</span>
          <LogoutButton onClick={logout}>Logout</LogoutButton>
        </div>
      </ChatHeader>
      <RoomSelector>
        <RoomButton onClick={() => handleRoomChange("general")}>
          General
        </RoomButton>
        <RoomButton onClick={() => handleRoomChange("random")}>
          Random
        </RoomButton>
      </RoomSelector>
      <MessagesContainer>
        {messages.map((msg) => (
          <Message
            key={msg._id}
            className={msg.sender.username === username ? "own-message" : ""}
          >
            <strong>{msg.sender.username}: </strong>
            {msg.content}
            {msg.sender.username === username && (
              <div className="message-actions">
                <EditButton
                  onClick={() => startEditMessage(msg._id, msg.content)}
                >
                  Edit
                </EditButton>
                <DeleteButton onClick={() => deleteMessage(msg._id)}>
                  Delete
                </DeleteButton>
              </div>
            )}
            {msg.isEdited && <span className="edited-tag"> (edited)</span>}
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <MessageForm onSubmit={sendMessage}>
        <MessageInput
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={
            editingMessageId ? "Edit your message..." : "Type a message..."
          }
          disabled={isSending}
        />
        <SendButton type="submit" disabled={!connected || isSending}>
          {editingMessageId ? "Update" : "Send"}
        </SendButton>
      </MessageForm>
      {!connected && (
        <ConnectionStatus>
          Disconnected. Trying to reconnect...
        </ConnectionStatus>
      )}
    </ChatContainer>
  );
}

export default Chat;
