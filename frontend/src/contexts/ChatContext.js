// messagingapp/frontend/src/contexts/ChatContext.js

import React, { createContext, useContext, useReducer, useEffect } from "react";

const ChatContext = createContext();

const initialState = {
  messages: [],
  rooms: [],
  currentRoom: null,
  connected: false,
  username: "",
  userId: null,
  isSending: false,
  editingMessageId: null,
  token: null,
  typingUsers: [],
  systemMessages: [],
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
      if (!state.rooms.some((room) => room._id === action.payload._id)) {
        console.log("Adding new room:", action.payload);
        return { ...state, rooms: [...state.rooms, action.payload] };
      }
      return state;
    case "SET_CURRENT_ROOM":
      return { ...state, currentRoom: action.payload, messages: [] };
    case "SET_ROOM_JOINED":
      return state.currentRoom && state.currentRoom._id === action.payload
        ? { ...state, currentRoom: { ...state.currentRoom, joined: true } }
        : state;
    case "SET_CONNECTED":
      return { ...state, connected: action.payload };
    case "SET_USER_ID":
      return { ...state, userId: action.payload };
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
    case "SET_USER_TYPING":
      const { username, isTyping } = action.payload;
      let updatedTypingUsers;
      if (isTyping && !state.typingUsers.includes(username)) {
        updatedTypingUsers = [...state.typingUsers, username];
      } else if (!isTyping) {
        updatedTypingUsers = state.typingUsers.filter(
          (user) => user !== username
        );
      } else {
        updatedTypingUsers = state.typingUsers;
      }
      return { ...state, typingUsers: updatedTypingUsers };
    case "UPDATE_MESSAGE_READ_STATUS":
      console.log("Updating message read status:", action.payload);
      console.log(
        "Message before update:",
        JSON.stringify(
          state.messages.find((msg) => msg._id === action.payload.messageId),
          null,
          2
        )
      );
      const updatedMessages = state.messages.map((msg) =>
        msg._id === action.payload.messageId
          ? {
              ...msg,
              readBy: msg.readBy.some(
                (read) => read.user._id === action.payload.userId
              )
                ? msg.readBy
                : [
                    ...msg.readBy,
                    {
                      user: {
                        _id: action.payload.userId,
                        username: action.payload.username,
                      },
                    },
                  ],
            }
          : msg
      );
      console.log("Updated messages:", updatedMessages);
      console.log(
        "Message after update:",
        JSON.stringify(
          updatedMessages.find((msg) => msg._id === action.payload.messageId),
          null,
          2
        )
      );
      return {
        ...state,
        messages: updatedMessages,
      };
    case "ADD_SYSTEM_MESSAGE":
      return {
        ...state,
        systemMessages: [...state.systemMessages, action.payload],
      };
    default:
      return state;
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
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
