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
  Label,
  FormField,
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
            <FormField>
              <Label htmlFor="roomName">Create Room Name</Label>
              <Input
                id="roomName"
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                required
              />
            </FormField>
            <FormField>
              <Label>Chat Type</Label>
              {/* Chat type input will go here */}
            </FormField>
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
