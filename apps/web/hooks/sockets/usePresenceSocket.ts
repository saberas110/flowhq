
"use client"

import { useEffect } from "react"
import useWebSocket from "react-use-websocket"
import { useChatContext } from "@/contexts/ChatContext";
import { TChatList, TSocketChatList } from "@flowhq/shared";

export default function usePresenceSocket() {

    const {chatList, setChatList} = useChatContext()

    const wsUrl:string = process.env.NEXT_PUBLIC_WS_PRESENCE_URL!;

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
      const message = lastJsonMessage as TSocketChatList;

      console.log('message',message )

    switch (message.type) {
        case "chat_list":
            handleChatList(message.conversations);
    }




  }, [lastJsonMessage]);




  const handleChatList = (data:TChatList[])=>{

    setChatList(data)
  }

  return {chatList}
}