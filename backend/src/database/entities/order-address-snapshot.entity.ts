import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_address_snapshots')
export class OrderAddressSnapshot {
  @PrimaryColumn('uuid')
  order_id: string;

  @Column()
  full_name: string;

  @Column()
  phone: string;

  @Column()
  country: string;

  @Column()
  city: string;

  @Column()
  street: string;

  @Column()
  postal_code: string;

  @OneToOne(() => Order, (order) => order.addressSnapshot)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
