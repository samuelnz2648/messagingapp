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
  const [token, setToken] = useState(localStorage.getItem("token"));
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const fetchMessages = useCallback(async () => {
    try {
      console.log("Fetching messages for room:", room);
      const response = await axios.get(
        `http://localhost:5001/api/messages/${room}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Fetched messages:", response.data.data.messages);
      setMessages(response.data.data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [room, token]);

  const initializeSocket = useCallback(() => {
    if (!token) {
      console.log("No token found, redirecting to login");
      navigate("/login");
      return;
    }

    if (!socket) {
      console.log("Initializing socket connection");
      socket = io("http://localhost:5001", {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        auth: { token },
      });

      socket.on("connect", () => {
        console.log("Socket connected");
        setConnected(true);
        joinRoom(room);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
        setConnected(false);
      });

      socket.on("message", (message) => {
        console.log("Received message:", message);
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      socket.on("messageUpdated", (updatedMessage) => {
        console.log("Message updated:", updatedMessage);
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === updatedMessage._id ? updatedMessage : msg
          )
        );
      });

      socket.on("messageDeleted", (deletedMessageId) => {
        console.log("Message deleted:", deletedMessageId);
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== deletedMessageId)
        );
      });
    }
  }, [navigate, room, token]);

  const joinRoom = useCallback(
    (newRoom) => {
      console.log("Joining room:", newRoom);
      socket.emit("joinRoom", newRoom);
      fetchMessages();
    },
    [fetchMessages]
  );

  useEffect(() => {
    initializeSocket();

    return () => {
      if (socket) {
        console.log("Cleaning up socket connection");
        socket.off("connect");
        socket.off("disconnect");
        socket.off("message");
        socket.off("messageUpdated");
        socket.off("messageDeleted");
        socket.disconnect();
        socket = null;
      }
    };
  }, [initializeSocket]);

  useEffect(() => {
    if (connected) {
      joinRoom(room);
    }
  }, [room, connected, joinRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchUsername = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched username:", response.data.data.user.username);
      setUsername(response.data.data.user.username);
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchUsername();
  }, [fetchUsername]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() && connected && !isSending) {
      setIsSending(true);

      try {
        if (editingMessageId) {
          console.log("Editing message:", editingMessageId);
          await socket.emit("editMessage", {
            messageId: editingMessageId,
            content: inputMessage.trim(),
            room,
          });
          setEditingMessageId(null);
        } else {
          console.log("Sending new message");
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
    console.log("Changing room from", room, "to", newRoom);
    setRoom(newRoom);
  };

  const startEditMessage = (messageId, content) => {
    console.log("Start editing message:", messageId);
    setEditingMessageId(messageId);
    setInputMessage(content);
  };

  const deleteMessage = async (messageId) => {
    try {
      console.log("Deleting message:", messageId);
      await socket.emit("deleteMessage", { messageId, room });
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message. Please try again.");
    }
  };

  const logout = () => {
    console.log("Logging out");
    localStorage.removeItem("token");
    setToken(null);
    setUsername("");
    setMessages([]);
    if (socket) {
      socket.disconnect();
      socket = null;
    }
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
