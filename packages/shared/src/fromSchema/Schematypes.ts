/**
 * Auto-generated types from OpenAPI schema
 * Do not edit manually - run: pnpm generate-types
 */

export enum TDirectionEnum {
  IN = "in",
  OUT = "out"
}

export enum TMediaTypeEnum {
  TEXT = "text",
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  DOCUMENT = "document"
}

export enum TMessageTypeEnum {
  EMAIL = "email",
  WHATSAPP = "whatsapp",
  TEXT = "text",
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  DOCUMENT = "document",
  LOCATION = "location",
  CONTACT = "contact",
  TEMPLATE = "template"
}

export enum TServiceTypeEnum {
  EMAIL = "email",
  WHATSAPP = "whatsapp"
}

export enum TStatusEnum {
  PENDING = "pending",
  SENDING = "sending",
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  FAILED = "failed",
  RECEIVED = "received"
}

export type TBaseMessage = {
  readonly id: number;
  text?: string | null;
  sender?: string;
  direction?: TDirectionEnum | TBlankEnum;
  status?: TStatusEnum;
  /** Format: date-time */
  readonly created_at: string | null;
  /** Format: date-time */
  readonly updated_at: string | null;
  /** Format: date-time */
  readonly sent_at: string | null;
  readonly service_type: string;
  readonly service_icon: string;
  readonly is_me: string;
  message_type?: TMessageTypeEnum;
};

export type TBaseMessageRequest = {
  text?: string | null;
  sender?: string;
  direction?: TDirectionEnum | TBlankEnum;
  status?: TStatusEnum;
  message_type?: TMessageTypeEnum;
};

export type TBaseServiceAccount = {
  readonly id: number;
  readonly service_type: TServiceTypeEnum;
  display_name?: string;
  readonly icon: string;
};

export type TBlankEnum = "";

export type TContact = {
  id: number;
  name: string;
  avatar: string;
  tags: TTag[] | null;
};

export type TConversation = {
  readonly id: number;
  readonly last_message: TLastMessage;
  readonly contact: TContact;
};

export type TConversationDetail = {
  readonly messages: TMessage[];
};

export type TEmailMessage = {
  readonly id: number;
  text?: string | null;
  sender?: string;
  direction?: TDirectionEnum | TBlankEnum;
  status?: TStatusEnum;
  /** Format: date-time */
  readonly created_at: string | null;
  /** Format: date-time */
  readonly updated_at: string | null;
  /** Format: date-time */
  readonly sent_at: string | null;
  readonly service_type: string;
  readonly service_icon: string;
  readonly is_me: string;
  message_type?: TMessageTypeEnum;
  subject: string;
  /** Format: email */
  from_email: string;
  /** Format: email */
  readonly to_email: string;
  cc_email?: unknown;
  bcc?: unknown;
  /** Format: email */
  reply_to?: string | null;
  html_body: string;
  readonly has_attachments: boolean;
  readonly labels: unknown;
  readonly email_message_id: string | null;
  readonly email_thread_id: string | null;
};

export type TEmailMessageRequest = {
  text?: string | null;
  sender?: string;
  direction?: TDirectionEnum | TBlankEnum;
  status?: TStatusEnum;
  message_type?: TMessageTypeEnum;
  subject: string;
  /** Format: email */
  from_email: string;
  cc_email?: unknown;
  bcc?: unknown;
  /** Format: email */
  reply_to?: string | null;
  html_body: string;
  service_account_id: number;
};

export type TEmailServiceAccount = {
  readonly id: number;
  readonly service_type: TServiceTypeEnum;
  display_name?: string;
  readonly icon: string;
  /** Format: email */
  email: string;
};

export type TLastMessage = {
  id: number;
  text: string;
  /** Format: date-time */
  created_at: string;
  sender: string;
  direction: string;
  status: string;
  readonly service_type: string;
  readonly service_icon: string;
};

export type TMessage = TEmailMessage | TWhatsAppMessage | TBaseMessage;

export type TNullEnum = null;

export type TSendMessageRequest = TEmailMessageRequest | TWhatsAppMessageRequest | TBaseMessageRequest;

export type TServiceAccount = TEmailServiceAccount | TWhatsAppServiceAccount | TBaseServiceAccount;

export type TTag = {
  id: number;
  name: string;
  color: string;
};

export type TWhatsAppMessage = {
  readonly id: number;
  text?: string | null;
  sender?: string;
  direction?: TDirectionEnum | TBlankEnum;
  status?: TStatusEnum;
  /** Format: date-time */
  readonly created_at: string | null;
  /** Format: date-time */
  readonly updated_at: string | null;
  /** Format: date-time */
  readonly sent_at: string | null;
  readonly service_type: string;
  readonly service_icon: string;
  readonly is_me: string;
  message_type?: TMessageTypeEnum;
  readonly from_number: string;
  readonly to_number: string;
  media_type?: (TMediaTypeEnum | TBlankEnum | TNullEnum) | null;
  /** Format: uri */
  media_url?: string | null;
  readonly media_id: string | null;
  readonly mime_type: string | null;
  caption?: string | null;
  readonly template_name: string | null;
  readonly template_language: string | null;
  readonly template_parameters: unknown;
  readonly wa_message_id: string | null;
  readonly wa_status: string | null;
  readonly is_media: boolean;
  filename?: string;
};

export type TWhatsAppMessageRequest = {
  text?: string | null;
  sender?: string;
  direction?: TDirectionEnum | TBlankEnum;
  status?: TStatusEnum;
  message_type?: TMessageTypeEnum;
  media_type?: (TMediaTypeEnum | TBlankEnum | TNullEnum) | null;
  /** Format: binary */
  file?: string;
  /** Format: uri */
  media_url?: string | null;
  caption?: string | null;
  service_account_id: number;
  filename?: string;
};

export type TWhatsAppServiceAccount = {
  readonly id: number;
  readonly service_type: TServiceTypeEnum;
  display_name?: string;
  readonly icon: string;
  phone_number: string;
};

