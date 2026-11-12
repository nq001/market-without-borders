import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('payment_events')
export class PaymentEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  order_id: string;

  @Column({ unique: true })
  provider_event_id: string;

  @Column()
  provider_status: string;

  @Column()
  internal_status: string;

  @Column('int')
  amount: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Order, (order) => order.paymentEvents)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
