import axiosInstance from './axios.config'

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    roles: string[]
  }
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

export async function login(credentials: LoginDto): Promise<AuthResponse> {
  const response = await axiosInstance.post<AuthResponse>(
    '/auth/login',
    credentials
  )
  return response.data
}

export async function register(data: RegisterDto): Promise<AuthResponse> {
  const response = await axiosInstance.post<AuthResponse>(
    '/auth/register',
    data
  )
  return response.data
}

export async function refreshTokens(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  const response = await axiosInstance.post<RefreshTokenResponse>(
    '/auth/refresh',
    { refreshToken }
  )
  return response.data
}

export async function logout(refreshToken: string): Promise<void> {
  await axiosInstance.post('/auth/logout', { refreshToken })
}

export async function getProfile(): Promise<any> {
  const response = await axiosInstance.post('/auth/me')
  return response.data
}

