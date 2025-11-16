import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  resource?: string;

  @IsString()
  @IsOptional()
  action?: string;
}

export class UpdatePermissionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  resource?: string;

  @IsString()
  @IsOptional()
  action?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class PermissionResponseDto {
  id!: string;
  name!: string;
  description!: string;
  resource!: string;
  action!: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
