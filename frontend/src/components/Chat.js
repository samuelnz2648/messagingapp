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
  ChatSidebar,
  ChatMain,
  ChatHeader,
  RoomList,
  RoomItem,
  ConnectionStatus,
  LogoutButton,
  MessagesContainer,
} from "../styles/ChatStyles";

function Chat() {
  const { state, dispatch } = useChatContext();
  const { joinRoom, sendMessage, deleteMessage } = useChatSocket();
  const { fetchMessages, fetchUsername } = useChatApi();
  const messagesEndRef = useRef(null);
  const prevMessageCountRef = useRef(0);
  const navigate = useNavigate();
  const [editingMessageContent, setEditingMessageContent] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
    if (state.messages.length > prevMessageCountRef.current) {
      scrollToBottom();
    }
    prevMessageCountRef.current = state.messages.length;
  }, [state.messages]);

  const handleRoomChange = (newRoom) => {
    if (newRoom !== state.room) {
      console.log("Changing room from", state.room, "to", newRoom);
      dispatch({ type: "SET_MESSAGES", payload: [] });
      dispatch({ type: "SET_ROOM", payload: newRoom });
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

  const logout = () => {
    console.log("Logging out");
    localStorage.removeItem("token");
    dispatch({ type: "RESET" });
    navigate("/login");
  };

  return (
    <ChatContainer>
      <ChatSidebar>
        <ChatHeader>
          <h2 className="text-xl font-bold">Chat Rooms</h2>
        </ChatHeader>
        <RoomList>
          <RoomItem
            onClick={() => handleRoomChange("general")}
            $active={state.room === "general"}
          >
            General
          </RoomItem>
          <RoomItem
            onClick={() => handleRoomChange("random")}
            $active={state.room === "random"}
          >
            Random
          </RoomItem>
        </RoomList>
      </ChatSidebar>
      <ChatMain>
        <ChatHeader>
          <h2 className="text-xl font-bold">Chat Room: {state.room}</h2>
          <div className="flex items-center space-x-4">
            <span>Logged in as: {state.username}</span>
            <LogoutButton onClick={logout}>Logout</LogoutButton>
          </div>
        </ChatHeader>
        <MessagesContainer>
          <MessageList
            messages={state.messages}
            username={state.username}
            onDeleteMessage={handleDeleteMessage}
            onEditMessage={handleEditMessage}
          />
          <div ref={messagesEndRef} />
        </MessagesContainer>
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
      </ChatMain>
    </ChatContainer>
  );
}

export default Chat;
