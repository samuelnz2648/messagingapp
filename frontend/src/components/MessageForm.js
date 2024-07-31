// src/components/MessageForm.js

import React, { useState, useEffect } from "react";
import {
  MessageForm as StyledMessageForm,
  MessageInput,
  SendButton,
} from "../styles/ChatStyles";

function MessageForm({
  onSendMessage,
  isEditing,
  isSending,
  isConnected,
  editingMessageContent,
}) {
  const [inputMessage, setInputMessage] = useState("");

  useEffect(() => {
    if (isEditing) {
      setInputMessage(editingMessageContent);
    } else {
      setInputMessage("");
    }
  }, [isEditing, editingMessageContent]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && isConnected && !isSending) {
      onSendMessage(inputMessage);
      setInputMessage("");
    }
  };

  return (
    <StyledMessageForm onSubmit={handleSubmit}>
      <MessageInput
        type="text"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        placeholder={isEditing ? "Edit your message..." : "Type a message..."}
        disabled={isSending}
      />
      <SendButton type="submit" disabled={!isConnected || isSending}>
        {isEditing ? "Update" : "Send"}
      </SendButton>
    </StyledMessageForm>
  );
}

export default MessageForm;
