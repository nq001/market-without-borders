import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Store } from './store.entity';
import { Order } from './order.entity';

export enum ComplaintStatus {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

export enum ComplaintAdminAction {
  NONE = 'NONE',
  STORE_SUSPENDED = 'STORE_SUSPENDED',
  WARNING_ISSUED = 'WARNING_ISSUED',
}

@Entity('complaints')
export class Complaint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  customer_id: string;

  @Column('uuid')
  store_id: string;

  @Column({ type: 'uuid', nullable: true })
  order_id: string | null;

  @Column()
  reason: string;

  @Column({ type: 'text' })
  details: string;

  @Column({ type: 'varchar', default: ComplaintStatus.PENDING })
  status: ComplaintStatus;

  @Column({ type: 'varchar', default: ComplaintAdminAction.NONE })
  admin_action: ComplaintAdminAction;

  @Column({ type: 'text', nullable: true })
  admin_notes: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @ManyToOne(() => Order, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'order_id' })
  order: Order | null;
}

