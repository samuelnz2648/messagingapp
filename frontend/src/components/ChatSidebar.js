// messagingapp/frontend/src/components/ChatSidebar.js

import React, { useState } from "react";
import RoomList from "./RoomList";
import {
  ChatSidebar as StyledChatSidebar,
  ChatHeader,
  CreateRoomButton,
} from "../styles/ChatStyles";

function ChatSidebar({ rooms, currentRoom, onRoomChange, onCreateRoom }) {
  const [newRoomName, setNewRoomName] = useState("");

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      onCreateRoom(newRoomName.trim());
      setNewRoomName("");
    }
  };

  return (
    <StyledChatSidebar>
      <ChatHeader>
        <h2 className="text-xl font-bold">Chat Rooms</h2>
      </ChatHeader>
      <RoomList
        rooms={rooms}
        currentRoom={currentRoom}
        onRoomChange={onRoomChange}
      />
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
    </StyledChatSidebar>
  );
}

export default ChatSidebar;
