import { TConversation, TMessage, TServiceAccount } from "@flowhq/shared";


type ChatListMessage = {
    conversations: TConversation[]
    type: 'chat_list'
}

type MessageChannels = {
    channels: TServiceAccount[]
    type: 'channels'
}




export type TScocketPresence =
    | ChatListMessage
    | MessageChannels








type TNewMessage = {
    type: "new_message"
    message: TMessage
}



    
type TInitMessage = {
    type: "init_messages"
    messages: TMessage[]
}



export type TSocketChat =
    | TInitMessage
    | TNewMessage