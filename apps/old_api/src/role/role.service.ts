import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './role.entity';
import { Permission } from '../permission/permission.entity';
import { CreateRoleDto, UpdateRoleDto } from './role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>
  ) {}

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['permissions'],
    });
  }

  async findById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions', 'users'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async findByName(name: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    let permissions: Permission[] = [];
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      permissions = await this.permissionRepository.find({
        where: { id: In(createRoleDto.permissionIds) },
      });

      if (permissions.length !== createRoleDto.permissionIds.length) {
        throw new BadRequestException('One or more permissions not found');
      }
    }

    const role = this.roleRepository.create({
      name: createRoleDto.name,
      description: createRoleDto.description,
      permissions,
    });

    return this.roleRepository.save(role);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findById(id);

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });

      if (existingRole) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    if (updateRoleDto.permissionIds) {
      const permissions = await this.permissionRepository.find({
        where: { id: In(updateRoleDto.permissionIds) },
      });

      if (permissions.length !== updateRoleDto.permissionIds.length) {
        throw new BadRequestException('One or more permissions not found');
      }

      role.permissions = permissions;
    }

    Object.assign(role, updateRoleDto);
    return this.roleRepository.save(role);
  }

  async delete(id: string): Promise<void> {
    const role = await this.findById(id);

    // Check if role has users assigned
    if (role.users && role.users.length > 0) {
      throw new BadRequestException('Cannot delete role with assigned users');
    }

    await this.roleRepository.remove(role);
  }

  async assignPermission(roleId: string, permissionId: string): Promise<Role> {
    const role = await this.findById(roleId);
    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (!role.permissions.find((p) => p.id === permissionId)) {
      role.permissions.push(permission);
      return this.roleRepository.save(role);
    }

    return role;
  }

  async removePermission(roleId: string, permissionId: string): Promise<Role> {
    const role = await this.findById(roleId);
    role.permissions = role.permissions.filter(
      (permission) => permission.id !== permissionId
    );
    return this.roleRepository.save(role);
  }
}
