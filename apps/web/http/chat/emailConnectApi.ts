import { apichat } from "../axiosConfig";

export interface ConnectEmailDto {
  email: string;
  app_password: string;
  provider: "gmail" | "outlook" | "yahoo" | "custom";
  imap_host?: string;
  imap_port?: number;
  smtp_host?: string;
  smtp_port?: number;
  folder?: string;
}

export interface ConnectEmailResponse {
  success: boolean;
  message: string;
}

export const emailConnect = async (
  data: ConnectEmailDto
): Promise<ConnectEmailResponse> => {
  const res = await apichat.post<ConnectEmailResponse>("email/connect", data);
  return res.data;
};
