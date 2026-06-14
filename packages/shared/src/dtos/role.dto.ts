// Shared DTOs for role management

export interface ICreateRoleDto {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface IUpdateRoleDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: string[];
}

export interface IRoleResponseDto {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  permissions: Array<{
    id: string;
    name: string;
    description: string;
    resource: string;
    action: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
