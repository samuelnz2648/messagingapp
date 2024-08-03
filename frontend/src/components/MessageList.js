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

function MessageList({ messages, username, onDeleteMessage, onEditMessage }) {
  return (
    <>
      {messages.map((msg, index) => {
        const isOwnMessage = msg.sender.username === username;
        return (
          <MessageItem
            key={msg._id}
            $isDeleting={msg.isDeleting}
            $index={index}
          >
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
                  <DeleteButton onClick={() => onDeleteMessage(msg._id)}>
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
