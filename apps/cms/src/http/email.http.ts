import axiosInstance from './axios.config'

export type EmailProvider = 'gmail' | 'outlook' | 'yahoo' | 'custom'

export interface ConnectEmailDto {
  email: string
  app_password: string
  provider: EmailProvider
  imap_host?: string
  imap_port?: number
  smtp_host?: string
  smtp_port?: number
  folder?: string
}

export interface ConnectEmailResponse {
  success: boolean
  message: string
}

export interface ConnectEmailError {
  error: string
  details?: string
}

export async function connectEmail(
  data: ConnectEmailDto
): Promise<ConnectEmailResponse> {
  const response = await axiosInstance.post<ConnectEmailResponse>(
    '/email/connect',
    data
  )
  return response.data
}
