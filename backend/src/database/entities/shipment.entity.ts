import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { ShipmentEvent } from './shipment-event.entity';
import { BusinessRuleViolationException } from '../../common/domain/domain-exception.base';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  order_id: string;

  @Column({ type: 'varchar', nullable: true })
  tracking_number: string | null;

  @Column({ type: 'varchar', nullable: true })
  provider: string | null;

  @Column({ default: 'PENDING' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Order, (order) => order.shipment)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @OneToMany(() => ShipmentEvent, (event) => event.shipment, { cascade: true })
  events: ShipmentEvent[];

  // --- Rich Domain Behavior ---

  public dispatch(trackingNumber: string, provider: string): void {
    if (this.status !== 'PENDING') {
      throw new BusinessRuleViolationException(
        `Cannot dispatch shipment in status ${this.status}`,
      );
    }
    this.status = 'SHIPPED';
    this.tracking_number = trackingNumber;
    this.provider = provider;
  }

  public markDelivered(): void {
    if (this.status !== 'SHIPPED') {
      throw new BusinessRuleViolationException(
        `Cannot deliver shipment in status ${this.status}`,
      );
    }
    this.status = 'DELIVERED';
  }
}
