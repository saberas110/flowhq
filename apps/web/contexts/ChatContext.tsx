'use client'
import React, {
  createContext,
  useContext,
  useRef,
  useState,
} from "react";
import { TConversation, TMessage, TMessageContext, TServiceAccount } from "@flowhq/shared";

export type TChatContext = {
  chatList: TConversation[];
  messages: TMessageContext[];
  channels: TServiceAccount[];
  isMessagesLoading: boolean;
  messagesCache: React.MutableRefObject<Map<number, TMessageContext[]>>;
  setChannels: React.Dispatch<React.SetStateAction<TServiceAccount[]>>;
  setMessages: React.Dispatch<React.SetStateAction<TMessageContext[]>>;
  setChatList: React.Dispatch<React.SetStateAction<TConversation[]>>;
  setIsMessagesLoading: React.Dispatch<React.SetStateAction<boolean>>;
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
  const [messages, setMessages] = useState<TMessageContext[]>([]);
  const [channels, setChannels] = useState<TServiceAccount[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const messagesCache = useRef<Map<number, TMessageContext[]>>(new Map());




  return(
    <chatContext.Provider value={{
      chatList, setChatList,
      messages, setMessages,
      channels, setChannels,
      isMessagesLoading, setIsMessagesLoading,
      messagesCache,
    }} >

      {children}

    </chatContext.Provider>
  )


}


