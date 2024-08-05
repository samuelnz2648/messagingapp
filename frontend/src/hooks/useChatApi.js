// messagingapp/frontend/src/hooks/useChatApi.js

import { useCallback } from "react";
import axios from "axios";
import { useChatContext } from "../contexts/ChatContext";

export function useChatApi() {
  const { state, dispatch } = useChatContext();

  const fetchMessages = useCallback(
    async (roomId) => {
      try {
        console.log("Fetching messages for room:", roomId);
        const response = await axios.get(
          `http://localhost:5001/api/messages/${roomId}`,
          {
            headers: { Authorization: `Bearer ${state.token}` },
          }
        );
        console.log("Fetched messages:", response.data.data.messages);
        const sortedMessages = response.data.data.messages.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        dispatch({ type: "SET_MESSAGES", payload: sortedMessages });
      } catch (error) {
        console.error("Error fetching messages:", error);
        if (error.response && error.response.status === 429) {
          console.log("Rate limit exceeded. Retrying in 5 seconds...");
          setTimeout(() => fetchMessages(roomId), 5000);
        } else if (error.message === "Network Error") {
          console.error("Network error: Unable to connect to the server");
        }
      }
    },
    [state.token, dispatch]
  );

  const fetchUsername = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/auth/user", {
        headers: { Authorization: `Bearer ${state.token}` },
      });
      console.log("Fetched username:", response.data.data.user.username);
      dispatch({
        type: "SET_USERNAME",
        payload: response.data.data.user.username,
      });
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  }, [state.token, dispatch]);

  const fetchRooms = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/rooms", {
        headers: { Authorization: `Bearer ${state.token}` },
      });
      console.log("Fetched rooms:", response.data.data.rooms);
      dispatch({ type: "SET_ROOMS", payload: response.data.data.rooms });
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  }, [state.token, dispatch]);

  const createRoom = useCallback(
    async (roomData) => {
      try {
        const response = await axios.post(
          "http://localhost:5001/api/rooms",
          roomData,
          {
            headers: { Authorization: `Bearer ${state.token}` },
          }
        );
        console.log("Created room:", response.data.data.room);
        dispatch({ type: "ADD_ROOM", payload: response.data.data.room });
        return response.data.data.room;
      } catch (error) {
        console.error("Error creating room:", error);
        throw error;
      }
    },
    [state.token, dispatch]
  );

  const joinRoom = useCallback(
    async (roomId) => {
      try {
        const response = await axios.post(
          `http://localhost:5001/api/rooms/${roomId}/join`,
          {},
          {
            headers: { Authorization: `Bearer ${state.token}` },
          }
        );
        console.log("Joined room:", response.data.data.room);
        return response.data.data.room;
      } catch (error) {
        console.error("Error joining room:", error);
        throw error;
      }
    },
    [state.token]
  );

  const leaveRoom = useCallback(
    async (roomId) => {
      try {
        await axios.post(
          `http://localhost:5001/api/rooms/${roomId}/leave`,
          {},
          {
            headers: { Authorization: `Bearer ${state.token}` },
          }
        );
        console.log("Left room:", roomId);
      } catch (error) {
        console.error("Error leaving room:", error);
        throw error;
      }
    },
    [state.token]
  );

  return {
    fetchMessages,
    fetchUsername,
    fetchRooms,
    createRoom,
    joinRoom,
    leaveRoom,
  };
}
