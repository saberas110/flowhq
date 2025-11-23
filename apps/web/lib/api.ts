import {
  ILoginDto,
  IRegisterDto,
  IAuthResponse,
  IAuthTokens,
  IUserProfile,
  IRefreshTokenDto,
  IChangePasswordDto,
} from "@repo/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4500";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "An error occurred",
      }));
      throw new Error(error.message || "Request failed");
    }

    return response.json();
  }

  async register(data: IRegisterDto): Promise<IAuthResponse> {
    return this.request<IAuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(data: ILoginDto): Promise<IAuthResponse> {
    return this.request<IAuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async refreshTokens(): Promise<IAuthTokens> {
    return this.request<IAuthTokens>("/auth/refresh", {
      method: "POST",
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  async getProfile(accessToken: string): Promise<IUserProfile> {
    return this.request<IUserProfile>("/auth/me", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async changePassword(
    accessToken: string,
    data: IChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.request("/auth/change-password", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_URL);
