'use client'
import React, {
  createContext,
  useContext,
  useState,
} from "react";
import { TConversation, TMessage, TMessageContext, TServiceAccount } from "@flowhq/shared";

export type TChatContext = {
  chatList: TConversation[];
  messages: TMessageContext[];
  channels: TServiceAccount[]
  setChannels: React.Dispatch<React.SetStateAction<TServiceAccount[]>>
  setMessages: React.Dispatch<React.SetStateAction<TMessageContext[]>>;
  setChatList: React.Dispatch<React.SetStateAction<TConversation[]>>;
};




const chatContext = createContext<TChatContext | null>(null);

export const useChatContext = () => {
    const context = useContext(chatContext)
    if (!context) {
      throw new Error("useChatContext must be used inside ChatProvider");
    }
    return context;
}


export default function ChatProvider({ children }: { children: React.ReactNode }) {

  const [chatList, setChatList] = useState<TConversation[]>([]);
  const [messages, setMessages] = useState<TMessageContext[]>([])
  const [channels, setChannels] = useState<TServiceAccount[]>([])




  return(
    <chatContext.Provider value={{chatList, setChatList, messages, setMessages, channels, setChannels}} >

      {children}

    </chatContext.Provider>
  )


}


