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
  WelcomeMessage,
  CreateRoomButton,
} from "../styles/ChatStyles";

function Chat() {
  const { state, dispatch } = useChatContext();
  const { joinRoom, sendMessage, deleteMessage } = useChatSocket();
  const { fetchMessages, fetchUsername, fetchRooms, createRoom } = useChatApi();
  const messagesEndRef = useRef(null);
  const prevMessageCountRef = useRef(0);
  const navigate = useNavigate();
  const [editingMessageContent, setEditingMessageContent] = useState("");
  const [newRoomName, setNewRoomName] = useState("");

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
      scrollToBottom();
    }
    prevMessageCountRef.current = state.messages.length;
  }, [state.messages]);

  const handleRoomChange = (roomId) => {
    const newRoom = state.rooms.find((room) => room._id === roomId);
    if (
      newRoom &&
      (!state.currentRoom || newRoom._id !== state.currentRoom._id)
    ) {
      console.log(
        "Changing room from",
        state.currentRoom?.name,
        "to",
        newRoom.name
      );
      dispatch({ type: "SET_MESSAGES", payload: [] });
      dispatch({
        type: "SET_CURRENT_ROOM",
        payload: { ...newRoom, joined: false },
      });
    }
  };

  const handleCreateRoom = async () => {
    if (newRoomName.trim()) {
      try {
        const newRoom = await createRoom({ name: newRoomName.trim() });
        setNewRoomName("");
        handleRoomChange(newRoom._id);
      } catch (error) {
        console.error("Failed to create room:", error);
      }
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
          {state.rooms.map((room) => (
            <RoomItem
              key={room._id}
              onClick={() => handleRoomChange(room._id)}
              $active={state.currentRoom && state.currentRoom._id === room._id}
            >
              {room.name}
            </RoomItem>
          ))}
        </RoomList>
        <div className="p-4">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="New room name"
            className="w-full p-2 mb-2 border rounded"
          />
          <CreateRoomButton onClick={handleCreateRoom}>
            Create Room
          </CreateRoomButton>
        </div>
      </ChatSidebar>
      <ChatMain>
        <ChatHeader>
          <h2 className="text-xl font-bold">
            {state.currentRoom
              ? `Chat Room: ${state.currentRoom.name}`
              : "Welcome"}
          </h2>
          <div className="flex items-center space-x-4">
            <span>Logged in as: {state.username}</span>
            <LogoutButton onClick={logout}>Logout</LogoutButton>
          </div>
        </ChatHeader>
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
