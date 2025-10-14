import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { Role } from '../role/role.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['roles', 'roles.permissions'],
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    let roles: Role[] = [];
    if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
      roles = await this.roleRepository.find({
        where: { id: In(createUserDto.roleIds) },
      });

      if (roles.length !== createUserDto.roleIds.length) {
        throw new BadRequestException('One or more roles not found');
      }
    } else {
      // Assign default 'user' role
      const defaultRole = await this.roleRepository.findOne({
        where: { name: 'user' },
      });

      if (defaultRole) {
        roles = [defaultRole];
      }
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    const user = this.userRepository.create({
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      password: hashedPassword,
      roles,
    });

    return this.userRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    if (updateUserDto.roleIds) {
      const roles = await this.roleRepository.find({
        where: { id: In(updateUserDto.roleIds) },
      });

      if (roles.length !== updateUserDto.roleIds.length) {
        throw new BadRequestException('One or more roles not found');
      }

      user.roles = roles;
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
  }

  async getUsersByRole(roleName: string): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where('role.name = :roleName', { roleName })
      .getMany();
  }

  async assignRole(userId: string, roleId: string): Promise<User> {
    const user = await this.findById(userId);
    const role = await this.roleRepository.findOne({ where: { id: roleId } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (!user.roles.find((r) => r.id === roleId)) {
      user.roles.push(role);
      return this.userRepository.save(user);
    }

    return user;
  }

  async removeRole(userId: string, roleId: string): Promise<User> {
    const user = await this.findById(userId);
    user.roles = user.roles.filter((role) => role.id !== roleId);
    return this.userRepository.save(user);
  }
}
