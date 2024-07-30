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
  className: "flex-grow overflow-y-auto p-4 space-y-2",
})``;

export const Message = styled.div.attrs({
  className: "bg-white rounded-lg p-2 shadow relative",
})`
  &.own-message {
    background-color: #e6f3ff;
    margin-left: auto;
  }

  .message-actions {
    display: none;
    position: absolute;
    right: 5px;
    top: 5px;
  }

  &:hover .message-actions {
    display: flex;
  }

  .edited-tag {
    font-size: 0.8em;
    color: #888;
    margin-left: 5px;
  }
`;

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
