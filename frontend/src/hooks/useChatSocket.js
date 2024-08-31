// messagingapp/frontend/src/hooks/useChatSocket.js

import { useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import { useChatContext } from "../contexts/ChatContext";

export function useChatSocket() {
  const { state, dispatch } = useChatContext();
  const { token, currentRoom } = state;
  const socketRef = useRef(null);
  const lastJoinTimestamp = useRef(null);

  const initializeSocket = useCallback(() => {
    if (!token) return;

    socketRef.current = io("http://localhost:5001", {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { token },
    });

    dispatch({ type: "SET_SOCKET", payload: socketRef.current });

    const logEvent = (eventName, data) => {
      console.log(`Socket event: ${eventName}`, data);
    };

    socketRef.current.on("connect", () => {
      logEvent("connect");
      dispatch({ type: "SET_CONNECTED", payload: true });
      if (currentRoom) {
        socketRef.current.emit("joinRoom", currentRoom._id);
      }
    });

    socketRef.current.on("disconnect", () => {
      logEvent("disconnect");
      dispatch({ type: "SET_CONNECTED", payload: false });
    });

    socketRef.current.on("message", (message) => {
      logEvent("message", message);
      dispatch({ type: "ADD_MESSAGE", payload: message });
    });

    socketRef.current.on("messageUpdated", (updatedMessage) => {
      logEvent("messageUpdated", updatedMessage);
      dispatch({ type: "UPDATE_MESSAGE", payload: updatedMessage });
    });

    socketRef.current.on("messageDeleting", (deletingMessageId) => {
      logEvent("messageDeleting", deletingMessageId);
      dispatch({ type: "SET_MESSAGE_DELETING", payload: deletingMessageId });
    });

    socketRef.current.on("messageDeleted", (deletedMessageId) => {
      logEvent("messageDeleted", deletedMessageId);
      dispatch({ type: "DELETE_MESSAGE", payload: deletedMessageId });
    });

    socketRef.current.on("roomJoined", ({ roomId, name }) => {
      logEvent("roomJoined", { roomId, name });
      dispatch({ type: "SET_ROOM_JOINED", payload: { _id: roomId, name } });
    });

    socketRef.current.on("roomLeft", ({ roomId, name }) => {
      logEvent("roomLeft", { roomId, name });
      if (currentRoom && currentRoom._id === roomId) {
        dispatch({ type: "SET_CURRENT_ROOM", payload: null });
      }
    });

    socketRef.current.on("userTyping", ({ username, isTyping }) => {
      logEvent("userTyping", { username, isTyping });
      dispatch({ type: "SET_USER_TYPING", payload: { username, isTyping } });
    });

    socketRef.current.on("newRoom", (roomData) => {
      logEvent("newRoom", roomData);
      if (
        !roomData.isPrivate ||
        (roomData.isPrivate && roomData.members.includes(state.userId))
      ) {
        dispatch({ type: "ADD_ROOM", payload: roomData.room });
      }
    });

    socketRef.current.on("messageRead", ({ messageId, userId, username }) => {
      logEvent("messageRead", { messageId, userId, username });
      dispatch({
        type: "UPDATE_MESSAGE_READ_STATUS",
        payload: { messageId, userId, username },
      });
    });

    socketRef.current.on(
      "userJoinedRoom",
      ({ username, roomId, timestamp, message }) => {
        logEvent("userJoinedRoom", { username, roomId, timestamp, message });
        const now = Date.now();
        // Only process the join message if it's been more than 5 seconds since the last one
        if (
          !lastJoinTimestamp.current ||
          now - lastJoinTimestamp.current > 5000
        ) {
          if (message) {
            dispatch({ type: "ADD_MESSAGE", payload: message });
          }
          lastJoinTimestamp.current = now;
        }
      }
    );

    socketRef.current.on(
      "userLeftRoom",
      ({ username, roomId, timestamp, message }) => {
        logEvent("userLeftRoom", { username, roomId, timestamp, message });
        if (message) {
          dispatch({ type: "ADD_MESSAGE", payload: message });
        }
      }
    );
  }, [token, dispatch, currentRoom, state.userId]);

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
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("leaveRoom", roomId);
    }
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

  const markMessageAsRead = useCallback(
    (messageId) => {
      if (socketRef.current && socketRef.current.connected) {
        console.log(
          `Marking message ${messageId} as read by user ${state.userId}`
        );
        socketRef.current.emit("markMessageRead", {
          messageId,
          userId: state.userId,
          username: state.username,
        });
      }
    },
    [state.userId, state.username]
  );

  return {
    joinRoom,
    leaveRoom,
    sendMessage,
    deleteMessage,
    sendTypingStatus,
    markMessageAsRead,
    socketRef,
  };
}
