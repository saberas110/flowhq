'use client'
import useWebSocket, {ReadyState} from "react-use-websocket";
import {useChatContext} from "@/contexts/ChatContext";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { TMessage, TSocketChat } from "@flowhq/shared";
import useSendMessage from "@/hooks/sockets/sendMessage";
import { getChatSocketUrl } from "@/lib/getWebSocketUrl";

export default function useChatSocket(conversation_id: number | null = null) {

  const {
    messages, setMessages,
    messagesCache,
    isMessagesLoading, setIsMessagesLoading,
  } = useChatContext()

  const prevConversationRef = useRef<number | null>(null);

  // When conversation changes: save old messages to cache, load cached for new
  useEffect(() => {
    // Save current messages to cache for the previous conversation
    if (prevConversationRef.current !== null && messages.length > 0) {
      messagesCache.current.set(prevConversationRef.current, [...messages]);
    }

    // Load cached messages for the new conversation (instant display)
    if (conversation_id !== null) {
      const cached = messagesCache.current.get(conversation_id);
      if (cached && cached.length > 0) {
        setMessages(cached);
        setIsMessagesLoading(false);
      } else {
        setMessages([]);
        setIsMessagesLoading(true);
      }
    } else {
      setMessages([]);
      setIsMessagesLoading(false);
    }

    prevConversationRef.current = conversation_id;
  }, [conversation_id]);

  // Auto-detect URL and add token for cross-domain (ngrok)
  const wsUrl = useMemo(() => 
    conversation_id ? getChatSocketUrl(conversation_id) : null
  , [conversation_id]);


  const { lastJsonMessage, readyState, sendJsonMessage } = useWebSocket(wsUrl, {
    shouldReconnect: () => true,
    reconnectAttempts: 1,
    reconnectInterval: 1000,

    onOpen: () => {
      console.log("✅ Connected to Chat Socket");
    }
    ,
    onClose: () => {
      console.log("❌ Disconnected from Chat Socket");
    },
    onError: (event) => {
      console.log("⚠️ WebSocket Error:", event);
    },
  },
  conversation_id !== null && conversation_id !== 0
  );

  const {sendEmailMessage, sendWhatsAppMessage } = useSendMessage({
    readyState, sendJsonMessage, conversation_id
  })


  const handleInitMessages = useCallback((newMessages: TMessage[]) => {
    setMessages(newMessages);
    setIsMessagesLoading(false);
    // Update cache with fresh data from server
    if (conversation_id !== null) {
      messagesCache.current.set(conversation_id, newMessages);
    }
  }, [conversation_id, setMessages, setIsMessagesLoading, messagesCache]);

  const handleNewMessage = useCallback((message: TMessage) => {
    setMessages(prev => {
      // Deduplicate: skip if a message with the same id already exists
      if ('id' in message && prev.some(m => 'id' in m && m.id === message.id)) {
        return prev;
      }
      const updated = [...prev, message];
      // Keep cache in sync
      if (conversation_id !== null) {
        messagesCache.current.set(conversation_id, updated);
      }
      return updated;
    });
  }, [conversation_id, setMessages, messagesCache]);


  useEffect(() => {
    if (!lastJsonMessage) return
    const socketMessage = lastJsonMessage as TSocketChat

    switch (socketMessage.type){
      case "init_messages":
        handleInitMessages(socketMessage.messages)
        break
      case "new_message":
        handleNewMessage(socketMessage.message)
    }
  }, [lastJsonMessage]);


return {
  messages,
  sendEmailMessage,
  sendWhatsAppMessage,
  isMessagesLoading,
  isConnected: readyState !== ReadyState.OPEN,
};
}