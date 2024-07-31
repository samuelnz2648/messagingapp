// src/components/MessageList.js

import React from "react";
import {
  MessagesContainer,
  Message,
  EditButton,
  DeleteButton,
} from "../styles/ChatStyles";

function MessageList({ messages, username, onDeleteMessage, onEditMessage }) {
  return (
    <MessagesContainer>
      {messages.map((msg) => (
        <Message
          key={msg._id}
          className={msg.sender.username === username ? "own-message" : ""}
        >
          <strong>{msg.sender.username}: </strong>
          {msg.content}
          {msg.sender.username === username && (
            <div className="message-actions">
              <EditButton onClick={() => onEditMessage(msg._id, msg.content)}>
                Edit
              </EditButton>
              <DeleteButton onClick={() => onDeleteMessage(msg._id)}>
                Delete
              </DeleteButton>
            </div>
          )}
          {msg.isEdited && <span className="edited-tag"> (edited)</span>}
        </Message>
      ))}
    </MessagesContainer>
  );
}

export default MessageList;
