import { TBaseMessageRequest, TEmailMessageRequest } from "../fromSchema";




type TSendMessageFields = {
    temp_id: string;
    service_account_id: number;
};

// جداگانه برای هر تایپ
export type TSendEmailMessage = TEmailMessageRequest& TSendMessageFields;
export type TSendBaseMessage = TBaseMessageRequest & TSendMessageFields;

// حالا union درست کار میکنه
export type TSendMessageParams = TSendEmailMessage | TSendBaseMessage;










