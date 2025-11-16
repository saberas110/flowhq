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
import { UserService } from './user.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Controller('users')
@UseGuards(RolesGuard, PermissionsGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @RequirePermissions('users:read')
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @RequirePermissions('users:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findById(id);
  }

  @Post()
  @RequirePermissions('users:create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Patch(':id')
  @RequirePermissions('users:update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @RequirePermissions('users:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.delete(id);
  }

  @Get('role/:roleName')
  @RequirePermissions('users:read')
  getUsersByRole(@Param('roleName') roleName: string) {
    return this.userService.getUsersByRole(roleName);
  }

  @Post(':userId/roles/:roleId')
  @RequirePermissions('users:update')
  assignRole(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string
  ) {
    return this.userService.assignRole(userId, roleId);
  }

  @Delete(':userId/roles/:roleId')
  @RequirePermissions('users:update')
  removeRole(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string
  ) {
    return this.userService.removeRole(userId, roleId);
  }
}
