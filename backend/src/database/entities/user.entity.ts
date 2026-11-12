import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { UserRole } from './user-role.entity';
import { Address } from './address.entity';
import { Cart } from './cart.entity';
import { Order } from './order.entity';
import { IdempotencyKey } from './idempotency-key.entity';

export enum UserApprovalStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'varchar', default: UserApprovalStatus.ACTIVE })
  approval_status: UserApprovalStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];

  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => IdempotencyKey, (key) => key.user)
  idempotencyKeys: IdempotencyKey[];

  // --- Rich Domain Behavior ---

  public getRoleNames(): string[] {
    if (!this.userRoles) return [];
    const roles: string[] = [];
    for (const ur of this.userRoles) {
      if (ur.role?.name) {
        roles.push(ur.role.name);
      }
    }
    return Array.from(new Set(roles));
  }

  public getPermissionActions(): string[] {
    if (!this.userRoles) return [];
    const permissions: string[] = [];
    for (const ur of this.userRoles) {
      if (ur.role?.rolePermissions) {
        for (const rp of ur.role.rolePermissions) {
          if (rp.permission?.action) {
            permissions.push(rp.permission.action);
          }
        }
      }
    }
    return Array.from(new Set(permissions));
  }
}
