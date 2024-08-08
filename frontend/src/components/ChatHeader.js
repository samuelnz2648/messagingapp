// messagingapp/frontend/src/components/ChatHeader.js

import React from "react";
import {
  ChatHeader as StyledChatHeader,
  LogoutButton,
} from "../styles/ChatStyles";

function ChatHeader({ currentRoom, username, onLogout }) {
  return (
    <StyledChatHeader>
      <h2 className="text-xl font-bold">
        {currentRoom ? `Chat Room: ${currentRoom.name}` : "Welcome"}
      </h2>
      <div className="flex items-center space-x-4">
        <span>Logged in as: {username}</span>
        <LogoutButton onClick={onLogout}>Logout</LogoutButton>
      </div>
    </StyledChatHeader>
  );
}

export default ChatHeader;
