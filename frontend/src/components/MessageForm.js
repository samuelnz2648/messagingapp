// messagingapp/frontend/src/components/MessageForm.js

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  onTyping,
}) {
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      setInputMessage(editingMessageContent);
    } else {
      setInputMessage("");
    }
  }, [isEditing, editingMessageContent]);

  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 3000); // Stop typing after 3 seconds of inactivity
  }, [isTyping, onTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && isConnected && !isSending) {
      onSendMessage(inputMessage);
      setInputMessage("");
      setIsTyping(false);
      onTyping(false);
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    handleTyping();
  };

  return (
    <StyledMessageForm onSubmit={handleSubmit}>
      <MessageInput
        type="text"
        value={inputMessage}
        onChange={handleInputChange}
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
