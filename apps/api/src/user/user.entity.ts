import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../role/role.entity';
import { RefreshToken } from '../auth/refresh-token.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isEmailVerified!: boolean;

  @Column({ nullable: true })
  @Exclude()
  emailVerificationToken!: string;

  @Column({ nullable: true })
  @Exclude()
  passwordResetToken!: string;

  @Column({ nullable: true })
  @Exclude()
  passwordResetExpires!: Date;

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'roleId',
      referencedColumnName: 'id',
    },
  })
  roles!: Role[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens!: RefreshToken[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Helper method to check if user has a specific role
  hasRole(roleName: string): boolean {
    return this.roles?.some((role) => role.name === roleName) || false;
  }

  // Helper method to check if user has a specific permission
  hasPermission(permissionName: string): boolean {
    if (!this.roles) return false;

    return this.roles.some((role) =>
      role.permissions?.some((permission) => permission.name === permissionName)
    );
  }

  // Helper method to get all permissions
  getAllPermissions(): string[] {
    if (!this.roles) return [];

    const permissions = new Set<string>();
    this.roles.forEach((role) => {
      role.permissions?.forEach((permission) => {
        permissions.add(permission.name);
      });
    });

    return Array.from(permissions);
  }
}
