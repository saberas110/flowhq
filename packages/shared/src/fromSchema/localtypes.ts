// localtypes.ts

import { TBaseMessage, TEmailMessage, TMessage, TWhatsAppMessage } from "./Schematypes";

// 1. این تایپ تشخیص میده یه فیلد readonly هست یا نه
type IfEquals<X, Y, A = X, B = never> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? A : B;

// 2. فقط کلیدهای readonly رو برمیگردونه
type ReadonlyKeys<T> = {
  [K in keyof T]-?: IfEquals<
    { [Q in K]: T[K] },
    { -readonly [Q in K]: T[K] },
    never,
    K
  >;
}[keyof T];

// 3. فقط کلیدهای writable (غیر readonly) رو برمیگردونه  
type WritableKeys<T> = {
  [K in keyof T]-?: IfEquals<
    { [Q in K]: T[K] },
    { -readonly [Q in K]: T[K] },
    K,
    never
  >;
}[keyof T];


type WritablePart<T> = Pick<T, WritableKeys<T>>;





type TLocalMessageFields = {
    temp_id: string;
    conversation_id: number;
    created_at: string;
};

// جداگانه برای هر تایپ
export type TLocalEmailMessage = WritablePart<TEmailMessage> & TLocalMessageFields;
export type TLocalWhatsAppMessage = WritablePart<TWhatsAppMessage> & TLocalMessageFields;
export type TLocalBaseMessage = WritablePart<TBaseMessage> & TLocalMessageFields;

// حالا union درست کار میکنه
export type TLocalMessage = TLocalEmailMessage | TLocalWhatsAppMessage | TLocalBaseMessage;

