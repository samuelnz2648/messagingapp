// messagingapp/frontend/src/components/ChatSidebar.js

import React, { useState } from "react";
import RoomList from "./RoomList";
import CreateRoomModal from "./CreateRoomModal";
import { useChatApi } from "../hooks/useChatApi";
import {
  ChatSidebar as StyledChatSidebar,
  ChatHeader,
  CreateRoomButton,
} from "../styles/ChatStyles";

function ChatSidebar({ rooms, currentRoom, onRoomChange }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { fetchRooms } = useChatApi();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateRoom = async (newRoom) => {
    await fetchRooms(); // Refresh the rooms list
    onRoomChange(newRoom._id);
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
        <CreateRoomButton onClick={handleOpenModal}>
          Create Room
        </CreateRoomButton>
      </div>
      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreateRoom={handleCreateRoom}
      />
    </StyledChatSidebar>
  );
}

export default ChatSidebar;
