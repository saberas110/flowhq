'use client'
import React, {
  createContext,
  useContext,
  useState,
} from "react";
import { TChatList, TMessage } from "@flowhq/shared";

export type TChatContext = {
  chatList: TChatList[];
  messages: TMessage[];
  setMessages: React.Dispatch<React.SetStateAction<TMessage[]>>;
  setChatList: React.Dispatch<React.SetStateAction<TChatList[]>>;
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

  const [chatList, setChatList] = useState<TChatList[]>([]);
  const [messages, setMessages] = useState<TMessage[]>([])




  return(
    <chatContext.Provider value={{chatList, setChatList, messages, setMessages}} >

      {children}

    </chatContext.Provider>
  )


}


