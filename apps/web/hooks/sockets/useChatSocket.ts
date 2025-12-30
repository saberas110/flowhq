'use client'
import useWebSocket, {ReadyState} from "react-use-websocket";
import {useChatContext} from "@/contexts/ChatContext";
import { useEffect, useState} from "react";
import { TMessage, TSocketMessages } from "@flowhq/shared";
import useSendMessage from "@/hooks/sockets/sendMessage";

export default function useChatSocket(conversation_id:number =0 ) {

  const {messages, setMessages} = useChatContext()
  const wsUrl: string |null = conversation_id
     ? `${process.env.NEXT_PUBLIC_WS_CHAT_URL}/${conversation_id}/`!
     : null




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
  conversation_id !== 0
  );

  const {sendEmailMessage } = useSendMessage({
    readyState, sendJsonMessage, conversation_id
  })



useEffect(() => {



  if (!lastJsonMessage) return
  const socketMessage = lastJsonMessage as TSocketMessages

  switch (socketMessage.type){

    case "init_messages":
      handleInitMessages(socketMessage.messages)
  }


}, [lastJsonMessage, conversation_id]);


const handleInitMessages = (messages:TMessage[])=>{
  setMessages(messages);
}



return {
  messages,
  sendEmailMessage,
  isConnected: readyState !== ReadyState.OPEN,
};
}