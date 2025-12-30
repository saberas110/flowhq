import {useCallback} from "react";
import {ReadyState} from "react-use-websocket";
import {MessageStatus, MessageType, TAttachment, TLocalEmailMessage, TSendEmailRequest,} from "@flowhq/shared";
import {useChatContext} from "@/contexts/ChatContext";

type SendEmailParams = {
  text: string;
  subject: string;
  body: string;
  to: string;
  from: string;
  cc?: string;
  bcc?: string;
  attachments?: File[];
};

type TUseSendParams = {
  readyState: ReadyState;
  sendJsonMessage: (message: TSendEmailRequest) => void;
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
    async (params: SendEmailParams) => {
      if (readyState !== ReadyState.OPEN) {
        console.log("connection failed");
        return;
      }
      const tempId = generateTempId();
      try {
        let attachments: TAttachment[] = [];
        if (params.attachments && params.attachments.length > 0) {
          const uploadPromises = params.attachments.map(async (file) => {
            return {
              name: file.name,
              url: await uploadFile(file),
              size: file.size,
              type: file.type,
            };
          });
          attachments = await Promise.all(uploadPromises);
        }

        const tempMessage: TLocalEmailMessage = {
          temp_id: tempId,
          type: MessageType.EMAIL,
          text: params.text || "",
          subject: params.subject.trim(),
          from_email: params.from,
          to_email: params.to,
          html_body: params.body.trim(),
          status: MessageStatus.PENDING,
          sender: "user",
          direction: "out",
          conversation_id,
          created_at: new Date().toISOString(),
          ...(params.cc && { cc_email: params.cc }),
          ...(params.bcc && { bcc: params.bcc }),
          ...(attachments.length > 0 && { attachments }),
        };

        console.log("tempMessage", tempMessage);

        setMessages((prev) => [...prev, tempMessage]);



        const sendEmail: TSendEmailRequest = {
          temp_id: tempId,
          type: MessageType.EMAIL,
          text: params.text || "",
          subject: params.subject.trim(),
          from_email: params.from.trim(),
          to_email: params.to.trim(),
          html_body: params.body.trim(),
          sender: "current_user",
          ...(params.cc && { cc_email: params.cc.trim() }),
          ...(params.bcc && { bcc: params.bcc.trim() }),
          ...(attachments.length > 0 && { attachments }),
        }

        sendJsonMessage(sendEmail);
      } catch (err) {
        console.log(err);
           setMessages((prev) =>
          prev.map((msg) =>
            'temp_id' in msg && msg.temp_id === tempId
              ? { ...msg, status: MessageStatus.FAILED }
              : msg
          )
        );
      }
    },
    [readyState, conversation_id, generateTempId, sendJsonMessage, uploadFile, setMessages]
  );
  return { sendEmailMessage };
}


