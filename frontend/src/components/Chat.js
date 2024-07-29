// messagingapp/frontend/src/components/Chat.js

import React, { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

let socket;

const ChatContainer = styled.div.attrs({
  className: "flex flex-col h-screen bg-gray-100"
})``;

const ChatHeader = styled.div.attrs({
  className: "bg-blue-600 text-white p-4 flex justify-between items-center"
})``;

const RoomSelector = styled.div.attrs({
  className: "bg-gray-200 p-2 flex space-x-2"
})``;

const RoomButton = styled.button.attrs({
  className: "px-4 py-2 bg-white rounded shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
})``;

const MessagesContainer = styled.div.attrs({
  className: "flex-grow overflow-y-auto p-4 space-y-2"
})``;

const Message = styled.div.attrs({
  className: "bg-white rounded-lg p-2 shadow"
})`
  &.own-message {
    background-color: #e6f3ff;
    margin-left: auto;
  }
`;

const MessageForm = styled.form.attrs({
  className: "flex p-4 bg-white"
})``;

const MessageInput = styled.input.attrs({
  className: "flex-grow border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
})``;

const SendButton = styled.button.attrs({
  className: "bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
})``;

const ConnectionStatus = styled.div.attrs({
  className: "bg-red-500 text-white p-2 text-center"
})``;

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
      console.log("Fetched messages:", response.data);
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

    socket.on("message", (message, tempMessageId) => {
      setMessages((prevMessages) => {
        if (tempMessageId) {
          return prevMessages.map((msg) =>
            msg._id === tempMessageId ? message : msg
          );
        } else {
          return [...prevMessages, message];
        }
      });
    });

    socket.on("messageConfirmation", (confirmedMessage, tempMessageId) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === tempMessageId ? confirmedMessage : msg
        )
      );
    });

    fetchUsername();

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message");
      socket.off("messageConfirmation");
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
      };

      const tempMessageId = `temp-${Date.now()}`;

      try {
        const tempMessage = {
          _id: tempMessageId,
          sender: { _id: localStorage.getItem("userId"), username: username },
          room: room,
          content: inputMessage.trim(),
          timestamp: new Date().toISOString(),
        };
        setMessages((prevMessages) => [...prevMessages, tempMessage]);
        setInputMessage("");
        scrollToBottom();

        await socket.emit("chatMessage", messageData, tempMessageId);
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== tempMessageId)
        );
        alert("Failed to send message. Please try again.");
        setInputMessage(messageData.content);
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
    <ChatContainer>
      <ChatHeader>
        <h2 className="text-xl font-bold">Chat Room: {room}</h2>
        <div className="flex items-center space-x-4">
          <span>Logged in as: {username}</span>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </ChatHeader>
      <RoomSelector>
        <RoomButton onClick={() => handleRoomChange("general")}>General</RoomButton>
        <RoomButton onClick={() => handleRoomChange("random")}>Random</RoomButton>
      </RoomSelector>
      <MessagesContainer>
        {messages.map((msg, index) => (
          <Message
            key={index}
            className={msg.sender.username === username ? "own-message" : ""}
          >
            <strong>{msg.sender.username}: </strong>
            {msg.content}
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <MessageForm onSubmit={sendMessage}>
        <MessageInput
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={isSending}
        />
        <SendButton type="submit" disabled={!connected || isSending}>
          {isSending ? "Sending..." : "Send"}
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