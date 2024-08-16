// messagingapp/frontend/src/hooks/useChatSocket.js

import { useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import { useChatContext } from "../contexts/ChatContext";

export function useChatSocket() {
  const { state, dispatch } = useChatContext();
  const { token, currentRoom } = state;
  const socketRef = useRef(null);

  const initializeSocket = useCallback(() => {
    if (!token) return;

    socketRef.current = io("http://localhost:5001", {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { token },
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected");
      dispatch({ type: "SET_CONNECTED", payload: true });
      if (currentRoom) {
        socketRef.current.emit("joinRoom", currentRoom._id);
      }
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected");
      dispatch({ type: "SET_CONNECTED", payload: false });
    });

    socketRef.current.on("message", (message) => {
      console.log("Received message:", message);
      dispatch({ type: "ADD_MESSAGE", payload: message });
    });

    socketRef.current.on("messageUpdated", (updatedMessage) => {
      console.log("Message updated:", updatedMessage);
      dispatch({ type: "UPDATE_MESSAGE", payload: updatedMessage });
    });

    socketRef.current.on("messageDeleting", (deletingMessageId) => {
      console.log("Message deleting:", deletingMessageId);
      dispatch({ type: "SET_MESSAGE_DELETING", payload: deletingMessageId });
    });

    socketRef.current.on("messageDeleted", (deletedMessageId) => {
      console.log("Message deleted:", deletedMessageId);
      dispatch({ type: "DELETE_MESSAGE", payload: deletedMessageId });
    });

    socketRef.current.on("roomJoined", ({ roomId, name }) => {
      console.log(`Joined room: ${name} (${roomId})`);
      dispatch({ type: "SET_ROOM_JOINED", payload: { _id: roomId, name } });
    });

    socketRef.current.on("roomLeft", ({ roomId, name }) => {
      console.log(`Left room: ${name} (${roomId})`);
      if (currentRoom && currentRoom._id === roomId) {
        dispatch({ type: "SET_CURRENT_ROOM", payload: null });
      }
    });

    socketRef.current.on("userJoined", ({ username }) => {
      console.log(`User joined: ${username}`);
    });

    socketRef.current.on("userLeft", ({ username }) => {
      console.log(`User left: ${username}`);
    });

    socketRef.current.on("userTyping", ({ username, isTyping }) => {
      console.log(`User ${username} is ${isTyping ? "typing" : "not typing"}`);
      dispatch({ type: "SET_USER_TYPING", payload: { username, isTyping } });
    });

    socketRef.current.on("newPublicRoom", (newRoom) => {
      console.log("Received newPublicRoom event:", newRoom);
      dispatch({ type: "ADD_ROOM", payload: newRoom });
    });

    socketRef.current.on("newRoom", (roomData) => {
      console.log("Received newRoom event:", roomData);
        dispatch({ type: "ADD_ROOM", payload: roomData.room });
    });
  }, [token, dispatch, currentRoom]);

  useEffect(() => {
    initializeSocket();

    return () => {
      if (socketRef.current) {
        console.log("Cleaning up socket connection");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [initializeSocket]);

  const joinRoom = useCallback((roomId) => {
    console.log("Joining room:", roomId);
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("joinRoom", roomId);
    }
  }, []);

  const leaveRoom = useCallback((roomId) => {
    console.log("Leaving room:", roomId);
    socketRef.current.emit("leaveRoom", roomId);
  }, []);

  const sendMessage = useCallback(
    (content) => {
      if (
        content.trim() &&
        state.connected &&
        !state.isSending &&
        state.currentRoom
      ) {
        dispatch({ type: "SET_IS_SENDING", payload: true });
        if (state.editingMessageId) {
          console.log("Editing message:", state.editingMessageId);
          socketRef.current.emit("editMessage", {
            messageId: state.editingMessageId,
            content: content.trim(),
            room: state.currentRoom._id,
          });
          dispatch({ type: "SET_EDITING_MESSAGE_ID", payload: null });
        } else {
          console.log("Sending new message");
          socketRef.current.emit("chatMessage", {
            room: state.currentRoom._id,
            content: content.trim(),
          });
        }
        dispatch({ type: "SET_IS_SENDING", payload: false });
      }
    },
    [
      state.connected,
      state.isSending,
      state.editingMessageId,
      state.currentRoom,
      dispatch,
    ]
  );

  const deleteMessage = useCallback(
    (messageId) => {
      if (state.currentRoom) {
        console.log("Deleting message:", messageId);
        socketRef.current.emit("deleteMessage", {
          messageId,
          room: state.currentRoom._id,
        });
      }
    },
    [state.currentRoom]
  );

  const sendTypingStatus = useCallback(
    (isTyping) => {
      if (state.currentRoom) {
        console.log("Sending typing status:", isTyping);
        socketRef.current.emit("typing", {
          room: state.currentRoom._id,
          isTyping,
        });
      }
    },
    [state.currentRoom]
  );

  return { joinRoom, leaveRoom, sendMessage, deleteMessage, sendTypingStatus };
}
