// messagingapp/frontend/src/components/MessageList.js

import React, { useEffect } from "react";
import {
  MessageWrapper,
  MessageContent,
  MessageSender,
  MessageActions,
  EditButton,
  DeleteButton,
  MessageItem,
  ReadReceipt,
} from "../styles/ChatStyles";

const Message = React.memo(
  ({
    msg,
    username,
    onDeleteMessage,
    onEditMessage,
    onMarkAsRead,
    currentUserId,
  }) => {
    const isOwnMessage = msg.sender.username === username;

    useEffect(() => {
      if (
        !isOwnMessage &&
        !msg.readBy.some((read) => read.user._id === currentUserId)
      ) {
        onMarkAsRead(msg._id);
      }
    }, [msg._id, msg.readBy, isOwnMessage, currentUserId, onMarkAsRead]);

    return (
      <MessageItem $isDeleting={msg.isDeleting}>
        <MessageWrapper $isOwnMessage={isOwnMessage}>
          <MessageContent $isOwnMessage={isOwnMessage}>
            <MessageSender $isOwnMessage={isOwnMessage}>
              {msg.sender.username}
            </MessageSender>
            {msg.content}
            {msg.isEdited && <span className="edited-tag"> (edited)</span>}
            {isOwnMessage && (
              <ReadReceipt>
                Read by: {msg.readBy.length}{" "}
                {msg.readBy.length === 1 ? "user" : "users"}
              </ReadReceipt>
            )}
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

function MessageList({
  messages,
  username,
  onDeleteMessage,
  onEditMessage,
  onMarkAsRead,
  currentUserId,
}) {
  return (
    <>
      {messages.map((msg) => (
        <Message
          key={msg._id}
          msg={msg}
          username={username}
          onDeleteMessage={onDeleteMessage}
          onEditMessage={onEditMessage}
          onMarkAsRead={onMarkAsRead}
          currentUserId={currentUserId}
        />
      ))}
    </>
  );
}

export default React.memo(MessageList);
