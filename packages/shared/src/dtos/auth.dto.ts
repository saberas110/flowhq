export type TRegisterDto = {
  email: string
  first_name: string
  last_name: string
  password: string
  confirm_password: string
}

export type TLoginDto = {
  email: string
  password: string
}


export type TRegisterResponse = {
  email: string,
  first_name: string,
  last_name: string
}

export type TLogOutResponse = {
  detail: string
}

































export interface IRegisterDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface ILoginDto {
  email: string;
  password: string;
}

export interface IRefreshTokenDto {
  refreshToken: string;
}

export interface IForgotPasswordDto {
  email: string;
}

export interface IResetPasswordDto {
  token: string;
  password: string;
}

export interface IChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  roles: Array<{
    id: string;
    name: string;
    description: string;
    permissions: Array<{
      id: string;
      name: string;
      description: string;
      resource: string;
      action: string;
    }>;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
