// messagingapp/frontend/src/components/MessageList.js

import React from "react";
import {
  MessagesContainer,
  MessageWrapper,
  MessageContent,
  MessageSender,
  MessageActions,
  EditButton,
  DeleteButton,
} from "../styles/ChatStyles";

function MessageList({ messages, username, onDeleteMessage, onEditMessage }) {
  return (
    <MessagesContainer>
      {messages.map((msg) => {
        const isOwnMessage = msg.sender.username === username;
        return (
          <MessageWrapper key={msg._id} $isOwnMessage={isOwnMessage}>
            <MessageContent $isOwnMessage={isOwnMessage}>
              <MessageSender $isOwnMessage={isOwnMessage}>
                {msg.sender.username}
              </MessageSender>
              {msg.content}
              {msg.isEdited && <span className="edited-tag"> (edited)</span>}
            </MessageContent>
            {isOwnMessage && (
              <MessageActions>
                <EditButton onClick={() => onEditMessage(msg._id, msg.content)}>
                  Edit
                </EditButton>
                <DeleteButton onClick={() => onDeleteMessage(msg._id)}>
                  Delete
                </DeleteButton>
              </MessageActions>
            )}
          </MessageWrapper>
        );
      })}
    </MessagesContainer>
  );
}

export default MessageList;
