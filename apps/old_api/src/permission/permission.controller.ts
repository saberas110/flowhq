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
import { PermissionService } from './permission.service';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CreatePermissionDto, UpdatePermissionDto } from './permission.dto';

@Controller('permissions')
@UseGuards(PermissionsGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @RequirePermissions('permissions:read')
  findAll() {
    return this.permissionService.findAll();
  }

  @Get(':id')
  @RequirePermissions('permissions:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionService.findById(id);
  }

  @Post()
  @RequirePermissions('permissions:create')
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Patch(':id')
  @RequirePermissions('permissions:update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePermissionDto: UpdatePermissionDto
  ) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @RequirePermissions('permissions:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionService.delete(id);
  }

  @Get('resource/:resource')
  @RequirePermissions('permissions:read')
  findByResource(@Param('resource') resource: string) {
    return this.permissionService.findByResource(resource);
  }

  @Get('action/:action')
  @RequirePermissions('permissions:read')
  findByAction(@Param('action') action: string) {
    return this.permissionService.findByAction(action);
  }
}
