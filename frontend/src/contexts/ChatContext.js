// messagingapp/frontend/src/contexts/ChatContext.js

import React, { createContext, useContext, useReducer, useEffect } from "react";

const ChatContext = createContext();

const initialState = {
  messages: [],
  rooms: [], // New field to store available rooms
  currentRoom: null,
  connected: false,
  username: "",
  isSending: false,
  editingMessageId: null,
  token: null,
};

function chatReducer(state, action) {
  switch (action.type) {
    case "SET_MESSAGES":
      return { ...state, messages: action.payload };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };
    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages
          .map((msg) => (msg._id === action.payload._id ? action.payload : msg))
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
      };
    case "SET_MESSAGE_DELETING":
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg._id === action.payload ? { ...msg, isDeleting: true } : msg
        ),
      };
    case "DELETE_MESSAGE":
      return {
        ...state,
        messages: state.messages.filter((msg) => msg._id !== action.payload),
      };
    case "SET_ROOMS":
      return { ...state, rooms: action.payload };
    case "ADD_ROOM":
      return { ...state, rooms: [...state.rooms, action.payload] };
    case "SET_CURRENT_ROOM":
      return { ...state, currentRoom: action.payload, messages: [] };
    case "SET_ROOM_JOINED":
      return state.currentRoom && state.currentRoom._id === action.payload
        ? { ...state, currentRoom: { ...state.currentRoom, joined: true } }
        : state;
    case "SET_CONNECTED":
      return { ...state, connected: action.payload };
    case "SET_USERNAME":
      return { ...state, username: action.payload };
    case "SET_IS_SENDING":
      return { ...state, isSending: action.payload };
    case "SET_EDITING_MESSAGE_ID":
      return { ...state, editingMessageId: action.payload };
    case "SET_TOKEN":
      return { ...state, token: action.payload };
    case "RESET":
      return { ...initialState, token: null };
    default:
      return state;
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch({ type: "SET_TOKEN", payload: token });
    }
  }, []);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  return useContext(ChatContext);
}
