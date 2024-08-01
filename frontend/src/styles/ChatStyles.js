// messagingapp/frontend/src/styles/ChatStyles.js

import styled from "styled-components";

export const ChatContainer = styled.div.attrs({
  className: "flex flex-col h-screen bg-gray-100",
})``;

export const ChatHeader = styled.div.attrs({
  className: "bg-blue-600 text-white p-4 flex justify-between items-center",
})``;

export const RoomSelector = styled.div.attrs({
  className: "bg-gray-200 p-2 flex space-x-2",
})``;

export const RoomButton = styled.button.attrs({
  className:
    "px-4 py-2 bg-white rounded shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
})``;

export const MessagesContainer = styled.div.attrs({
  className: "flex-grow overflow-y-auto p-4 space-y-4",
})``;

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
