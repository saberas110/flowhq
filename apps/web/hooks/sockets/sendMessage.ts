import { useCallback } from "react";
import { ReadyState } from "react-use-websocket";
import { TStatusEnum, TMessageTypeEnum, TLocalMessage, TDirectionEnum,  TSendMessageParams, TSendEmailMessage, TEmailMessageRequest, } from "@flowhq/shared";
import { useChatContext } from "@/contexts/ChatContext";


type TUseSendParams = {
  readyState: ReadyState;
  sendJsonMessage: (message: TSendMessageParams) => void;
  conversation_id: number;
};

export default function useSendMessage({
  readyState,
  sendJsonMessage,
  conversation_id,
}: TUseSendParams) {
  const { setMessages } = useChatContext();

  const generateTempId = useCallback(() => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    return data.url;
  }, []);

  const sendEmailMessage = useCallback(

    async (params: TEmailMessageRequest) => {
      if (readyState !== ReadyState.OPEN) {
        console.log("connection failed");
        return;
      }

        console.log('params', params);
        


      const tempId = generateTempId();
      try {
        // let attachments: TAttachment[] = [];
        // if (params.attachments && params.attachments.length > 0) {
        //   const uploadPromises = params.attachments.map(async (file) => {
        //     return {
        //       name: file.name,
        //       url: await uploadFile(file),
        //       size: file.size,
        //       type: file.type,
        //     };
        //   });
        //   attachments = await Promise.all(uploadPromises);
        // }

        const tempMessage: TLocalMessage = {
          temp_id: tempId,
          message_type: TMessageTypeEnum.EMAIL,
          text: params.html_body || "",
          subject: params.subject.trim(),
          html_body: params.html_body?.trim(),
          from_email: params.from_email,
          status: TStatusEnum.PENDING,
          sender: "user",
          direction: TDirectionEnum.OUT,
          conversation_id,
          created_at: new Date().toISOString(), ...(params.cc_email ? { cc_email: params.cc_email } : {}),
          ...(params.bcc ? { bcc: params.bcc } : {}),
          ...(params.cc_email ? { cc_email: params.cc_email } : {}),
          // ...(attachments.length > 0 && { attachments }),
        };

        console.log("tempMessage", tempMessage);

        setMessages((prev) => [...prev, tempMessage]);



        const sendEmail: TSendEmailMessage= {
          temp_id: tempId,
          message_type: TMessageTypeEnum.EMAIL,
          text: params.text || "",
          subject: params.subject.trim(),
          from_email:params.from_email,
          html_body: params.html_body?.trim(),
          sender: "current_user",
          ...(params.bcc ? { bcc: params.bcc } : {}),
          ...(params.cc_email ? { cc_email: params.cc_email } : {}),
          // ...(attachments.length > 0 && { attachments }),
        }

        sendJsonMessage(sendEmail);
      } catch (err) {
        console.log(err);
        setMessages((prev) =>
          prev.map((msg) =>
            'temp_id' in msg && msg.temp_id === tempId
              ? { ...msg, status: TStatusEnum.FAILED }
              : msg
          )
        );
      }
    },
    [readyState, conversation_id, generateTempId, sendJsonMessage, uploadFile, setMessages]
  );
  return { sendEmailMessage };
}


