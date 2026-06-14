import { TBaseMessageRequest, TEmailMessageRequest, TWhatsAppMessageRequest } from "../fromSchema";




type TSendMessageFields = {
    temp_id: string;
    service_account_id: number;
};

// جداگانه برای هر تایپ
export type TSendEmailMessage = TEmailMessageRequest& TSendMessageFields;
export type TSendBaseMessage = TBaseMessageRequest & TSendMessageFields;
export type TSendWhatsAppMessage = TWhatsAppMessageRequest & TSendMessageFields

// حالا union درست کار میکنه
export type TSendMessageParams = TSendEmailMessage | TSendBaseMessage |TSendWhatsAppMessage;



export type TFileUploadResponse = {
    url: string
    filename: string
    size: number
    content_type: string
    media_type: string
}



export type TUseFileAttachmentReturn = {
    // State
    selectedFile: File | null
    filePreview: string | null
    isUploading: boolean
    uploadError: string | null

    // Actions
    openFilePicker: () => void
    removeFile: () => void
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    uploadFile: () => Promise<TFileUploadResponse | null>

    // Ref (attach to hidden <input type="file">)
    fileInputRef: React.RefObject<HTMLInputElement | null>
}



export type TUseFileAttachmentOptions = {
    maxSizeMB?: number
    accept?: string[]
}







