'use client'
import useWebSocket, {ReadyState} from "react-use-websocket";
import {useChatContext} from "@/contexts/ChatContext";
import { useEffect, useMemo } from "react";
import { TMessage, TSocketChat } from "@flowhq/shared";
import useSendMessage from "@/hooks/sockets/sendMessage";
import { getChatSocketUrl } from "@/lib/getWebSocketUrl";

export default function useChatSocket(conversation_id: number | null = null) {

  const {messages, setMessages} = useChatContext()
  
  // Auto-detect URL and add token for cross-domain (ngrok)
  const wsUrl = useMemo(() => 
    conversation_id ? getChatSocketUrl(conversation_id) : null
  , [conversation_id]);




  console.log("🔍 Connecting to:", wsUrl);

  const { lastJsonMessage, readyState, sendJsonMessage } = useWebSocket(wsUrl, {
    shouldReconnect: () => true,
    reconnectAttempts: 1,
    reconnectInterval: 1000,

    onOpen: () => {
      console.log("✅ Connected to Chat Socket");
    },
    onClose: () => {
      console.log("❌ Disconnected from Chat Socket");
    },
    onError: (event) => {
      console.log("⚠️ WebSocket Error:", event);
    },
  },
  conversation_id !== null && conversation_id !== 0
  );

  const {sendEmailMessage } = useSendMessage({
    readyState, sendJsonMessage, conversation_id
  })



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


}, [lastJsonMessage, conversation_id]);


const handleInitMessages = (messages:TMessage[])=>{
  setMessages(messages);
}

const handleNewMessage = (message:TMessage)=>{
  setMessages(prev=>(
    [...prev, message]
  ))
}



return {
  messages,
  sendEmailMessage,
  isConnected: readyState !== ReadyState.OPEN,
};
}