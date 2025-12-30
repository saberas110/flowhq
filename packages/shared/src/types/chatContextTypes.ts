type Tag = {
  id: number;
  name: string;
  color: string;
};

type Contact = {
  id: number;
  name: string | null;
  avatar: string;
  tags: Tag[] | null;
};

type LastMessage = {
  id: number;
  text: string;
  created_at: string; // ISO string
  sender: number | string;
  direction: string;
  status: string;
  channel: string;
  service_icon: string;
};

export type TChatList = {
  id: number;
  contact: Contact;
  last_message: LastMessage;
};

type TEmailAccount = {
  id: number;
  type: string;
  display_name: string;
  email: string;
  icon: string;
};

export enum MessageType {
  TEXT = "text",
  EMAIL = "email",
  WHATSAPP = "whatsapp",
  FILE = "file",
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  LOCATION = "location",
  CONTACT = "contact",
}

export enum MessageStatus {
  PENDING = "pending",
  SENDING = "sending",
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  FAILED = "failed",
}


export type TAttachment = {
  name: string;
  url: string;
  size: number;
  type: string;
};




type TMessageBase = {
  type: MessageType;
  text: string;
  sender: string;
  direction: string;
};


type TEmailBase = {
  type: MessageType.EMAIL;
  subject: string;
  from_email: string;
  to_email: string;
  cc_email?: string;
  bcc?: string;
  reply_to?: string | null;
  html_body?: string;
  text: string;
  attachments?: TAttachment[];
};


export type TBaseMessage = TMessageBase & {
  id: number;
  created_at: string;
  updated_at: string;
  sent_at: string;
  status: MessageStatus;
  conversation_id?: number;
};


export type TEmailMessage = TEmailBase & {
  id: number;
  created_at: string;
  updated_at: string;
  sent_at: string;
  status: MessageStatus;
  conversation_id?: number;
  sender: string;
  direction: string;
  service_icon?: string;
  is_me?: boolean;
  has_attachments?: boolean;
  labels?: string[];
  email_message_id?: string;
  email_thread_id?: string | null;
  service_account?: TEmailAccount;
};

export type TMessage = TEmailMessage | TBaseMessage;


export type TSendMessageRequest = TMessageBase & {
  temp_id?: string;
};

export type TSendEmailRequest = TEmailBase & {
  temp_id?: string;
  sender: string;
};


export type TLocalBaseMessage = TMessageBase & {
  temp_id: string;
  conversation_id: number;
  status: MessageStatus.PENDING;
  created_at: string;
};


export type TLocalEmailMessage = TEmailBase & {
  temp_id: string;
  conversation_id: number;
  status: MessageStatus.PENDING;
  created_at: string;
  sender: string;
  direction: string;
};


export type TServerMessage = TEmailMessage | TBaseMessage;
export type TMessage = TServerMessage | TLocalMessage;


export type TLocalMessage = TLocalEmailMessage | TLocalBaseMessage;







