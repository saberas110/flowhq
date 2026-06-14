// Shared DTOs for permission management

export interface ICreatePermissionDto {
  name: string;
  description?: string;
  resource?: string;
  action?: string;
}

export interface IUpdatePermissionDto {
  name?: string;
  description?: string;
  resource?: string;
  action?: string;
  isActive?: boolean;
}

export interface IPermissionResponseDto {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
