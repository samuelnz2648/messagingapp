// messagingapp/frontend/src/components/Chat.js

import React, { useEffect, useRef, useState, useCallback } from "react";
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
  TypingIndicator,
} from "../styles/ChatStyles";

function Chat() {
  const navigate = useNavigate();
  const { state, dispatch } = useChatContext();
  const {
    joinRoom,
    sendMessage,
    deleteMessage,
    sendTypingStatus,
    markMessageAsRead,
  } = useChatSocket();
  const { fetchMessages, fetchUsername, fetchRooms } = useChatApi(navigate);
  const messagesEndRef = useRef(null);
  const prevMessageCountRef = useRef(0);
  const [editingMessageContent, setEditingMessageContent] = useState("");

  useEffect(() => {
    console.log("Rooms updated:", state.rooms);
  }, [state.rooms]);

  useEffect(() => {
    const token = state.token || sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      if (!state.token) {
        dispatch({ type: "SET_TOKEN", payload: token });
      }
      fetchUsername();
      fetchRooms();
    }
  }, [state.token, dispatch, fetchUsername, fetchRooms, navigate]);

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
    sessionStorage.removeItem("token");
    dispatch({ type: "RESET" });
    navigate("/login");
  };

  const handleMarkAsRead = (messageId) => {
    if (
      !state.messages
        .find((msg) => msg._id === messageId)
        ?.readBy.includes(state.userId)
    ) {
      markMessageAsRead(messageId);
    }
  };

  return (
    <ChatContainer>
      <ChatSidebar
        rooms={state.rooms}
        currentRoom={state.currentRoom}
        onRoomChange={handleRoomChange}
      />
      <ChatMain>
        <ChatHeader
          currentRoom={state.currentRoom}
          username={state.username}
          onLogout={handleLogout}
        />
        <MessagesContainer>
          {state.currentRoom ? (
            <>
              <MessageList
                messages={state.messages}
                username={state.username}
                onDeleteMessage={handleDeleteMessage}
                onEditMessage={handleEditMessage}
                onMarkAsRead={handleMarkAsRead}
                currentUserId={state.userId}
              />
              {state.typingUsers.length > 0 && (
                <TypingIndicator>
                  {state.typingUsers.join(", ")}{" "}
                  {state.typingUsers.length === 1 ? "is" : "are"} typing...
                </TypingIndicator>
              )}
            </>
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
            onTyping={sendTypingStatus}
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
