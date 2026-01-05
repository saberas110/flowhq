'use client'
import React, {
  createContext,
  useContext,
  useState,
} from "react";
import { TConversation, TMessage, TMessageContext } from "@flowhq/shared";

export type TChatContext = {
  chatList: TConversation[];
  messages: TMessageContext[];
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




  return(
    <chatContext.Provider value={{chatList, setChatList, messages, setMessages}} >

      {children}

    </chatContext.Provider>
  )


}


