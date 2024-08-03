// messagingapp/frontend/src/styles/ChatStyles.js

import styled, { keyframes } from "styled-components";

export const ChatContainer = styled.div.attrs({
  className: "flex h-screen bg-gray-100",
})``;

export const ChatSidebar = styled.div.attrs({
  className: "w-64 bg-gray-200 flex flex-col",
})``;

export const ChatMain = styled.div.attrs({
  className: "flex-1 flex flex-col",
})`
  height: 100vh;
`;

export const ChatHeader = styled.div.attrs({
  className:
    "bg-blue-600 text-white p-4 flex justify-between items-center h-16",
})``;

export const RoomList = styled.div.attrs({
  className: "flex-1 overflow-y-auto",
})``;

export const RoomItem = styled.button.attrs({
  className: "w-full text-left px-4 py-2 hover:bg-gray-300 focus:outline-none",
})`
  background-color: ${(props) => (props.$active ? "#e5e7eb" : "transparent")};
  font-weight: ${(props) => (props.$active ? "bold" : "normal")};
`;

export const MessagesContainer = styled.div.attrs({
  className: "flex-grow overflow-y-auto p-4",
})`
  height: calc(100vh - 64px - 60px); // Subtract header and form heights
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const MessageItem = styled.div`
  margin-bottom: 1rem;
  max-height: 1000px;
  opacity: 1;
  overflow: hidden;
  transition: all 0.3s ease-out;
  animation: ${fadeIn} 0.3s ease-out;
  animation-fill-mode: backwards;
  animation-delay: ${(props) => props.$index * 0.1}s;

  ${(props) =>
    props.$isDeleting &&
    `
    max-height: 0;
    margin-bottom: 0;
    opacity: 0;
  `}
`;

export const MessageWrapper = styled.div.attrs({
  className: "flex",
})`
  justify-content: ${(props) =>
    props.$isOwnMessage ? "flex-end" : "flex-start"};
`;

export const MessageContent = styled.div.attrs({
  className: "rounded-lg p-3 max-w-xs lg:max-w-md",
})`
  background-color: ${(props) => (props.$isOwnMessage ? "#e6f3ff" : "white")};
  ${(props) =>
    props.$isOwnMessage
      ? "border-top-right-radius: 0;"
      : "border-top-left-radius: 0;"}
`;

export const MessageSender = styled.div.attrs({
  className: "font-bold mb-1",
})`
  color: ${(props) => (props.$isOwnMessage ? "#3b82f6" : "#4b5563")};
  ${(props) => (props.$isOwnMessage ? "text-right;" : "text-left;")}
`;

export const MessageActions = styled.div.attrs({
  className: "flex mt-1 space-x-2 justify-end",
})``;

export const MessageForm = styled.form.attrs({
  className: "flex p-4 bg-white",
})``;

export const MessageInput = styled.input.attrs({
  className:
    "flex-grow border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
})``;

export const SendButton = styled.button.attrs({
  className:
    "bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500",
})``;

export const ConnectionStatus = styled.div.attrs({
  className: "bg-red-500 text-white p-2 text-center",
})``;

export const LogoutButton = styled.button.attrs({
  className: "bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600",
})``;

export const EditButton = styled.button.attrs({
  className:
    "bg-yellow-500 text-white px-2 py-1 rounded text-xs mr-1 hover:bg-yellow-600",
})``;

export const DeleteButton = styled.button.attrs({
  className: "bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600",
})``;
