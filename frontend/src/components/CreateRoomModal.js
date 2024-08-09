// messagingapp/frontend/src/components/CreateRoomModal.js

import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
} from "../styles/ModalStyles";

function CreateRoomModal({ isOpen, onClose, onCreateRoom }) {
  const [roomName, setRoomName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateRoom(roomName);
    setRoomName("");
  };

  if (!isOpen) return null;

  return (
    <Modal>
      <ModalOverlay onClick={onClose} />
      <ModalContent>
        <ModalHeader>Create New Room</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <Input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              required
            />
          </form>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} $primary>
            Create Room
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CreateRoomModal;
