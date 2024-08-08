// messagingapp/frontend/src/components/Chat.js

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatContext } from "../contexts/ChatContext";
import { useChatSocket } from "../hooks/useChatSocket";
import { useChatApi } from "../hooks/useChatApi";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageForm from "./MessageForm";
import {
  ChatContainer,
  ChatMain,
  MessagesContainer,
  WelcomeMessage,
  ConnectionStatus,
} from "../styles/ChatStyles";

function Chat() {
  const { state, dispatch } = useChatContext();
  const { joinRoom, sendMessage, deleteMessage } = useChatSocket();
  const { fetchMessages, fetchUsername, fetchRooms, createRoom } = useChatApi();
  const messagesEndRef = useRef(null);
  const prevMessageCountRef = useRef(0);
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
      fetchRooms();
    }
  }, [state.token, navigate, fetchUsername, fetchRooms, dispatch]);

  useEffect(() => {
    if (state.connected && state.currentRoom && !state.currentRoom.joined) {
      joinRoom(state.currentRoom._id);
      fetchMessages(state.currentRoom._id);
    }
  }, [state.currentRoom, state.connected, joinRoom, fetchMessages]);

  useEffect(() => {
    if (state.messages.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessageCountRef.current = state.messages.length;
  }, [state.messages]);

  const handleRoomChange = (roomId) => {
    const newRoom = state.rooms.find((room) => room._id === roomId);
    if (
      newRoom &&
      (!state.currentRoom || newRoom._id !== state.currentRoom._id)
    ) {
      dispatch({ type: "SET_MESSAGES", payload: [] });
      dispatch({
        type: "SET_CURRENT_ROOM",
        payload: { ...newRoom, joined: false },
      });
    }
  };

  const handleCreateRoom = async (roomName) => {
    try {
      const newRoom = await createRoom({ name: roomName });
      handleRoomChange(newRoom._id);
    } catch (error) {
      console.error("Failed to create room:", error);
    }
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

  const handleDeleteMessage = (messageId) => {
    deleteMessage(messageId);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "RESET" });
    navigate("/login");
  };

  return (
    <ChatContainer>
      <ChatSidebar
        rooms={state.rooms}
        currentRoom={state.currentRoom}
        onRoomChange={handleRoomChange}
        onCreateRoom={handleCreateRoom}
      />
      <ChatMain>
        <ChatHeader
          currentRoom={state.currentRoom}
          username={state.username}
          onLogout={handleLogout}
        />
        <MessagesContainer>
          {state.currentRoom ? (
            <MessageList
              messages={state.messages}
              username={state.username}
              onDeleteMessage={handleDeleteMessage}
              onEditMessage={handleEditMessage}
            />
          ) : (
            <WelcomeMessage>Click on a chat to start chatting!</WelcomeMessage>
          )}
          <div ref={messagesEndRef} />
        </MessagesContainer>
        {state.currentRoom && (
          <MessageForm
            onSendMessage={handleSendMessage}
            isEditing={!!state.editingMessageId}
            isSending={state.isSending}
            isConnected={state.connected}
            editingMessageContent={editingMessageContent}
          />
        )}
        {!state.connected && (
          <ConnectionStatus>
            Disconnected. Trying to reconnect...
          </ConnectionStatus>
        )}
      </ChatMain>
    </ChatContainer>
  );
}

export default Chat;
