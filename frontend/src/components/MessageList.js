// messagingapp/frontend/src/components/MessageList.js

import React, { useEffect, useCallback } from "react";
import {
  MessageWrapper,
  MessageContent,
  MessageSender,
  MessageActions,
  EditButton,
  DeleteButton,
  MessageItem,
  ReadReceipt,
  SystemMessage,
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
    const isOwnMessage = msg.sender && msg.sender.username === username;

    useEffect(() => {
      if (
        !isOwnMessage &&
        msg.sender &&
        !msg.readBy.some((read) => read.user._id === currentUserId)
      ) {
        onMarkAsRead(msg._id);
      }
    }, [
      msg._id,
      msg.readBy,
      msg.sender,
      isOwnMessage,
      currentUserId,
      onMarkAsRead,
    ]);

    if (msg.type === "system") {
      return <SystemMessage>{msg.content}</SystemMessage>;
    }

    const readByUsers = msg.readBy
      .filter((read) => read.user._id !== msg.sender._id)
      .map((read) => read.user.username)
      .join(", ");

    return (
      <MessageItem $isDeleting={msg.isDeleting}>
        <MessageWrapper $isOwnMessage={isOwnMessage}>
          <MessageContent $isOwnMessage={isOwnMessage}>
            <MessageSender $isOwnMessage={isOwnMessage}>
              {msg.sender.username}
            </MessageSender>
            {msg.content}
            {msg.isEdited && <span className="edited-tag"> (edited)</span>}
            {isOwnMessage && readByUsers && (
              <ReadReceipt>Read by: {readByUsers}</ReadReceipt>
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
  console.log("MessageList rendered with messages:", messages);

  const memoizedOnDeleteMessage = useCallback(onDeleteMessage, [
    onDeleteMessage,
  ]);
  const memoizedOnEditMessage = useCallback(onEditMessage, [onEditMessage]);
  const memoizedOnMarkAsRead = useCallback(onMarkAsRead, [onMarkAsRead]);

  return (
    <>
      {messages.map((msg) => (
        <Message
          key={msg._id || `${msg.type}-${msg.timestamp}`}
          msg={msg}
          username={username}
          onDeleteMessage={memoizedOnDeleteMessage}
          onEditMessage={memoizedOnEditMessage}
          onMarkAsRead={memoizedOnMarkAsRead}
          currentUserId={currentUserId}
        />
      ))}
    </>
  );
}

export default React.memo(MessageList);
