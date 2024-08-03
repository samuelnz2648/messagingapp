// messagingapp/frontend/src/hooks/useChatSocket.js

import { useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import { useChatContext } from "../contexts/ChatContext";

export function useChatSocket() {
  const { state, dispatch } = useChatContext();
  const { token, room } = state;
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
      socketRef.current.emit("joinRoom", room);
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
  }, [token, room, dispatch]);

  useEffect(() => {
    initializeSocket();

    return () => {
      if (socketRef.current) {
        console.log("Cleaning up socket connection");
        socketRef.current.disconnect();
      }
    };
  }, [initializeSocket]);

  const joinRoom = useCallback((newRoom) => {
    console.log("Joining room:", newRoom);
    socketRef.current.emit("joinRoom", newRoom);
  }, []);

  const sendMessage = useCallback(
    (content) => {
      if (content.trim() && state.connected && !state.isSending) {
        dispatch({ type: "SET_IS_SENDING", payload: true });
        if (state.editingMessageId) {
          console.log("Editing message:", state.editingMessageId);
          socketRef.current.emit("editMessage", {
            messageId: state.editingMessageId,
            content: content.trim(),
            room: state.room,
          });
          dispatch({ type: "SET_EDITING_MESSAGE_ID", payload: null });
        } else {
          console.log("Sending new message");
          socketRef.current.emit("chatMessage", {
            room: state.room,
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
      state.room,
      dispatch,
    ]
  );

  const deleteMessage = useCallback(
    (messageId) => {
      console.log("Deleting message:", messageId);
      socketRef.current.emit("deleteMessage", { messageId, room: state.room });
    },
    [state.room]
  );

  return { joinRoom, sendMessage, deleteMessage };
}