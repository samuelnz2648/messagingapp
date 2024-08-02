// messagingapp/frontend/src/components/MessageList.js

import React, { useState, useEffect } from "react";
import {
  MessageWrapper,
  MessageContent,
  MessageSender,
  MessageActions,
  EditButton,
  DeleteButton,
  MessageItem,
} from "../styles/ChatStyles";

function MessageList({ messages, username, onDeleteMessage, onEditMessage }) {
  const [deletingMessages, setDeletingMessages] = useState({});

  useEffect(() => {
    const newDeletingMessages = {};
    messages.forEach((msg) => {
      newDeletingMessages[msg._id] = false;
    });
    setDeletingMessages(newDeletingMessages);
  }, [messages]);

  const handleDelete = (messageId) => {
    setDeletingMessages((prev) => ({ ...prev, [messageId]: true }));
    setTimeout(() => {
      onDeleteMessage(messageId);
    }, 300); // This should match the transition duration in CSS
  };

  return (
    <>
      {messages.map((msg) => {
        const isOwnMessage = msg.sender.username === username;
        return (
          <MessageItem key={msg._id} $isDeleting={deletingMessages[msg._id]}>
            <MessageWrapper $isOwnMessage={isOwnMessage}>
              <MessageContent $isOwnMessage={isOwnMessage}>
                <MessageSender $isOwnMessage={isOwnMessage}>
                  {msg.sender.username}
                </MessageSender>
                {msg.content}
                {msg.isEdited && <span className="edited-tag"> (edited)</span>}
              </MessageContent>
              {isOwnMessage && (
                <MessageActions>
                  <EditButton
                    onClick={() => onEditMessage(msg._id, msg.content)}
                  >
                    Edit
                  </EditButton>
                  <DeleteButton onClick={() => handleDelete(msg._id)}>
                    Delete
                  </DeleteButton>
                </MessageActions>
              )}
            </MessageWrapper>
          </MessageItem>
        );
      })}
    </>
  );
}

export default React.memo(MessageList);
