// messagingapp/frontend/src/components/Chat.js

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatContext } from "../contexts/ChatContext";
import { useChatSocket } from "../hooks/useChatSocket";
import { useChatApi } from "../hooks/useChatApi";
import MessageList from "./MessageList";
import MessageForm from "./MessageForm";
import {
  ChatContainer,
  ChatHeader,
  RoomSelector,
  RoomButton,
  ConnectionStatus,
  LogoutButton,
} from "../styles/ChatStyles";

function Chat() {
  const { state, dispatch } = useChatContext();
  const { joinRoom, sendMessage, deleteMessage } = useChatSocket();
  const { fetchMessages, fetchUsername } = useChatApi();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [editingMessageContent, setEditingMessageContent] = useState("");

  useEffect(() => {
    const token = state.token || localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      if (!state.token) {
        dispatch({ type: "SET_TOKEN", payload: token });
      }
      fetchUsername();
    }
  }, [state.token, navigate, fetchUsername, dispatch]);

  useEffect(() => {
    if (state.connected) {
      joinRoom(state.room);
      fetchMessages();
    }
  }, [state.room, state.connected, joinRoom, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  const handleRoomChange = (newRoom) => {
    console.log("Changing room from", state.room, "to", newRoom);
    dispatch({ type: "SET_MESSAGES", payload: [] });
    dispatch({ type: "SET_ROOM", payload: newRoom });
  };

  const handleEditMessage = (messageId, content) => {
    dispatch({ type: "SET_EDITING_MESSAGE_ID", payload: messageId });
    setEditingMessageContent(content);
  };

  const handleSendMessage = (content) => {
    sendMessage(content);
    if (state.editingMessageId) {
      dispatch({ type: "SET_EDITING_MESSAGE_ID", payload: null });
      setEditingMessageContent("");
    }
  };

  const logout = () => {
    console.log("Logging out");
    localStorage.removeItem("token");
    dispatch({ type: "RESET" });
    navigate("/login");
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <h2 className="text-xl font-bold">Chat Room: {state.room}</h2>
        <div className="flex items-center space-x-4">
          <span>Logged in as: {state.username}</span>
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
      <MessageList
        messages={state.messages}
        username={state.username}
        onDeleteMessage={deleteMessage}
        onEditMessage={handleEditMessage}
      />
      <div ref={messagesEndRef} />
      <MessageForm
        onSendMessage={handleSendMessage}
        isEditing={!!state.editingMessageId}
        isSending={state.isSending}
        isConnected={state.connected}
        editingMessageContent={editingMessageContent}
      />
      {!state.connected && (
        <ConnectionStatus>
          Disconnected. Trying to reconnect...
        </ConnectionStatus>
      )}
    </ChatContainer>
  );
}

export default Chat;
