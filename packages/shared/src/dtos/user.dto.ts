// Shared DTOs for user management

export interface ICreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleIds?: string[];
}

export interface IUpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roleIds?: string[];
}

export interface IUserResponseDto {
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
  }>;
  createdAt: Date;
  updatedAt: Date;
}
