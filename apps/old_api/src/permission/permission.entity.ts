import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Role } from '../role/role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ nullable: true })
  resource!: string; // The resource this permission applies to (e.g., 'users', 'posts', 'settings')

  @Column({ nullable: true })
  action!: string; // The action this permission allows (e.g., 'create', 'read', 'update', 'delete')

  @Column({ default: true })
  isActive!: boolean;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles!: Role[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
