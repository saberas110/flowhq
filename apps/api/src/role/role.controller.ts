import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CreateRoleDto, UpdateRoleDto } from './role.dto';

@Controller('roles')
@UseGuards(PermissionsGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @RequirePermissions('roles:read')
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @RequirePermissions('roles:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.roleService.findById(id);
  }

  @Post()
  @RequirePermissions('roles:create')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Patch(':id')
  @RequirePermissions('roles:update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto
  ) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @RequirePermissions('roles:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.roleService.delete(id);
  }

  @Post(':roleId/permissions/:permissionId')
  @RequirePermissions('roles:update')
  assignPermission(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string
  ) {
    return this.roleService.assignPermission(roleId, permissionId);
  }

  @Delete(':roleId/permissions/:permissionId')
  @RequirePermissions('roles:update')
  removePermission(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string
  ) {
    return this.roleService.removePermission(roleId, permissionId);
  }
}
