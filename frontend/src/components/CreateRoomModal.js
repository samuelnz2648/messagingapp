// messagingapp/frontend/src/components/CreateRoomModal.js

import React, { useState, useEffect } from "react";
import { useChatApi } from "../hooks/useChatApi";
import { useChatContext } from "../contexts/ChatContext";
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
  Switch,
  Select,
  CheckboxWrapper,
} from "../styles/ModalStyles";

function CreateRoomModal({ isOpen, onClose, onCreateRoom }) {
  const [roomName, setRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const { fetchAllUsers, createRoom } = useChatApi();
  const { state } = useChatContext();

  useEffect(() => {
    if (isOpen) {
      fetchAllUsers().then(setAllUsers);
    }
  }, [isOpen, fetchAllUsers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const roomData = {
        name: roomName,
        isPrivate,
        members: isPrivate ? selectedUsers : [],
      };
      const newRoom = await createRoom(roomData);
      onCreateRoom(newRoom);
      setRoomName("");
      setIsPrivate(true);
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      console.error("Error creating room:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
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
              <Label htmlFor="roomName">Room Name</Label>
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
              <Switch>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={() => setIsPrivate(!isPrivate)}
                />
                <span className="slider"></span>
              </Switch>
              <span>{isPrivate ? "Private" : "Public"}</span>
            </FormField>
            {isPrivate && (
              <FormField>
                <Label>Select User(s)</Label>
                <Select multiple>
                  {allUsers
                    .filter((user) => user._id !== state.userId)
                    .map((user) => (
                      <CheckboxWrapper key={user._id}>
                        <input
                          type="checkbox"
                          id={`user-${user._id}`}
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleUserSelect(user._id)}
                        />
                        <label htmlFor={`user-${user._id}`}>
                          {user.username}
                        </label>
                      </CheckboxWrapper>
                    ))}
                </Select>
              </FormField>
            )}
          </form>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            $primary
            disabled={
              !roomName.trim() || (isPrivate && selectedUsers.length === 0)
            }
          >
            Create Room
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CreateRoomModal;
