// messagingapp/frontend/src/hooks/useChatApi.js

import { useCallback } from "react";
import axios from "axios";
import { useChatContext } from "../contexts/ChatContext";

export function useChatApi(navigate) {
  const { state, dispatch } = useChatContext();

  const fetchMessages = useCallback(
    async (roomId) => {
      try {
        console.log("Fetching messages for room:", roomId);
        const token = state.token || sessionStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5001/api/messages/${roomId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
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
        } else if (error.response && error.response.status === 401) {
          sessionStorage.removeItem("token");
          dispatch({ type: "RESET" });
          navigate("/login");
        } else if (error.message === "Network Error") {
          console.error("Network error: Unable to connect to the server");
        }
      }
    },
    [dispatch, navigate]
  );

  const fetchUsername = useCallback(async () => {
    try {
      const token = state.token || sessionStorage.getItem("token");
      const response = await axios.get("http://localhost:5001/api/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched user data:", response.data.data.user);
      dispatch({
        type: "SET_USERNAME",
        payload: response.data.data.user.username,
      });
      dispatch({
        type: "SET_USER_ID",
        payload: response.data.data.user._id,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response && error.response.status === 401) {
        sessionStorage.removeItem("token");
        dispatch({ type: "RESET" });
        navigate("/login");
      }
    }
  }, [dispatch, navigate]);

  const fetchRooms = useCallback(async () => {
    try {
      const token = state.token || sessionStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5001/api/auth/user-rooms",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Fetched rooms:", response.data.data.rooms);
      dispatch({ type: "SET_ROOMS", payload: response.data.data.rooms });
    } catch (error) {
      console.error("Error fetching rooms:", error);
      if (error.response && error.response.status === 401) {
        sessionStorage.removeItem("token");
        dispatch({ type: "RESET" });
        navigate("/login");
      }
    }
  }, [dispatch, navigate]);

  const createRoom = useCallback(
    async (roomData) => {
      try {
        const token = state.token || sessionStorage.getItem("token");
        const response = await axios.post(
          "http://localhost:5001/api/rooms",
          roomData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Created room:", response.data.data.room);
        dispatch({ type: "ADD_ROOM", payload: response.data.data.room });
        return response.data.data.room;
      } catch (error) {
        console.error("Error creating room:", error);
        if (error.response && error.response.status === 401) {
          sessionStorage.removeItem("token");
          dispatch({ type: "RESET" });
          navigate("/login");
        }
        throw error;
      }
    },
    [dispatch, navigate]
  );

  const joinRoom = useCallback(
    async (roomId) => {
      try {
        const token = state.token || sessionStorage.getItem("token");
        const response = await axios.post(
          `http://localhost:5001/api/rooms/${roomId}/join`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Joined room:", response.data.data.room);
        return response.data.data.room;
      } catch (error) {
        console.error("Error joining room:", error);
        if (error.response && error.response.status === 401) {
          sessionStorage.removeItem("token");
          dispatch({ type: "RESET" });
          navigate("/login");
        }
        throw error;
      }
    },
    [dispatch, navigate]
  );

  const leaveRoom = useCallback(
    async (roomId) => {
      try {
        const token = state.token || sessionStorage.getItem("token");
        await axios.post(
          `http://localhost:5001/api/rooms/${roomId}/leave`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Left room:", roomId);
      } catch (error) {
        console.error("Error leaving room:", error);
        if (error.response && error.response.status === 401) {
          sessionStorage.removeItem("token");
          dispatch({ type: "RESET" });
          navigate("/login");
        }
        throw error;
      }
    },
    [dispatch, navigate]
  );

  const fetchAllUsers = useCallback(async () => {
    try {
      const token = state.token || sessionStorage.getItem("token");
      const response = await axios.get("http://localhost:5001/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched all users:", response.data.data.users);
      return response.data.data.users;
    } catch (error) {
      console.error("Error fetching all users:", error);
      if (error.response && error.response.status === 401) {
        sessionStorage.removeItem("token");
        dispatch({ type: "RESET" });
        navigate("/login");
      }
      throw error;
    }
  }, [dispatch, navigate]);

  return {
    fetchMessages,
    fetchUsername,
    fetchRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    fetchAllUsers,
  };
}
