// messagingapp/frontend/src/components/RoomList.js

import React from "react";
import { RoomList as StyledRoomList, RoomItem } from "../styles/ChatStyles";

function RoomList({ rooms, currentRoom, onRoomChange }) {
  return (
    <StyledRoomList>
      {rooms.map((room) => (
        <RoomItem
          key={room._id}
          onClick={() => onRoomChange(room._id)}
          $active={currentRoom && currentRoom._id === room._id}
        >
          {room.name}
        </RoomItem>
      ))}
    </StyledRoomList>
  );
}

export default RoomList;
