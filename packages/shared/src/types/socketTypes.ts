import { TChatList, TMessage } from "@flowhq/shared";


type ChatListMessage = {
    conversations: TChatList[]
    type: 'chat_list'
}

export type TSocketChatList =
    | ChatListMessage


type InitMessage = {
    type: "init_messages"
    messages: TMessage[]
}

export type TSocketMessages =
    | InitMessage