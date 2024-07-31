import { useCallback } from "react";
import axios from "axios";
import { useChatContext } from "../contexts/ChatContext";

export function useChatApi() {
  const { state, dispatch } = useChatContext();

  const fetchMessages = useCallback(async () => {
    try {
      console.log("Fetching messages for room:", state.room);
      const response = await axios.get(
        `http://localhost:5001/api/messages/${state.room}`,
        {
          headers: { Authorization: `Bearer ${state.token}` },
        }
      );
      console.log("Fetched messages:", response.data.data.messages);
      dispatch({ type: "SET_MESSAGES", payload: response.data.data.messages });
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [state.room, state.token, dispatch]);

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

  return { fetchMessages, fetchUsername };
}
