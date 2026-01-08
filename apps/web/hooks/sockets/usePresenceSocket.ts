"use client"

import { useEffect, useMemo } from "react"
import useWebSocket from "react-use-websocket"
import { useChatContext } from "@/contexts/ChatContext";
import { TConversation, TScocketPresence, TServiceAccount } from "@flowhq/shared";
import { getPresenceSocketUrl } from "@/lib/getWebSocketUrl";

export default function usePresenceSocket() {

    const {chatList, setChatList, channels, setChannels} = useChatContext()

    // Auto-detect URL and add token for cross-domain (ngrok)
    const wsUrl = useMemo(() => getPresenceSocketUrl(), []);

    console.log("🔍 Connecting to:", wsUrl);
    const {lastJsonMessage} = useWebSocket(
      wsUrl,
      {
        shouldReconnect: () => true,
        reconnectAttempts: 1,
        reconnectInterval: 1000,

        onOpen: () => {
          console.log("✅ Connected to WebSocket");
        },
        onClose: () => {
          console.log("❌ Disconnected from WebSocket");
        },
        onError: (event) => {
          console.log("⚠️ WebSocket Error:", event);
        },
      },
    );


  useEffect(() => {
    if (!lastJsonMessage ) return
      const message = lastJsonMessage as TScocketPresence;

      console.log('message',message )

    switch (message.type) {
        case "chat_list":
            handleChatList(message.conversations);
            break;
        case "channels":
            handleChannels(message.channels);
            break;
    }




  }, [lastJsonMessage]);




  const handleChatList = (data:TConversation[])=>{

    setChatList(data)
  }



  const handleChannels = (data:TServiceAccount[])=>{
    console.log('data in handleChannels', data)
    setChannels(data)
  }
  return {chatList, channels}
}