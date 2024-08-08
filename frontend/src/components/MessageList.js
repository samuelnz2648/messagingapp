// messagingapp/frontend/src/components/MessageList.js

import React from "react";
import {
  MessageWrapper,
  MessageContent,
  MessageSender,
  MessageActions,
  EditButton,
  DeleteButton,
  MessageItem,
} from "../styles/ChatStyles";

const Message = React.memo(
  ({ msg, username, onDeleteMessage, onEditMessage }) => {
    const isOwnMessage = msg.sender.username === username;

    return (
      <MessageItem $isDeleting={msg.isDeleting}>
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
              <EditButton onClick={() => onEditMessage(msg._id, msg.content)}>
                Edit
              </EditButton>
              <DeleteButton onClick={() => onDeleteMessage(msg._id)}>
                Delete
              </DeleteButton>
            </MessageActions>
          )}
        </MessageWrapper>
      </MessageItem>
    );
  }
);

function MessageList({ messages, username, onDeleteMessage, onEditMessage }) {
  return (
    <>
      {messages.map((msg) => (
        <Message
          key={msg._id}
          msg={msg}
          username={username}
          onDeleteMessage={onDeleteMessage}
          onEditMessage={onEditMessage}
        />
      ))}
    </>
  );
}

export default React.memo(MessageList);
