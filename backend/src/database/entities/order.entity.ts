import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Coupon } from './coupon.entity';
import { OrderItem } from './order-item.entity';
import { OrderAddressSnapshot } from './order-address-snapshot.entity';
import { PaymentEvent } from './payment-event.entity';
import { Shipment } from './shipment.entity';
import { Store } from './store.entity';
import { BusinessRuleViolationException } from '../../common/domain/domain-exception.base';

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  PREPARING = 'PREPARING',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  REFUNDED = 'REFUNDED',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  store_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  parent_order_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  coupon_id: string | null;

  @Column()
  status: string;

  @Column('int')
  total_amount: number;

  @Column('int')
  subtotal_amount: number;

  @Column('int')
  discount_amount: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Store, (store) => store.orders, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'store_id' })
  store: Store | null;

  @ManyToOne(() => Coupon, (coupon) => coupon.orders)
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon | null;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];

  @OneToOne(() => OrderAddressSnapshot, (snapshot) => snapshot.order)
  addressSnapshot: OrderAddressSnapshot;

  @OneToMany(() => PaymentEvent, (paymentEvent) => paymentEvent.order)
  paymentEvents: PaymentEvent[];

  @OneToOne(() => Shipment, (shipment) => shipment.order)
  shipment: Shipment;

  // --- Rich Domain Behavior ---

  public canAcceptPayment(): boolean {
    return this.status === OrderStatus.PENDING_PAYMENT;
  }

  public isPaidOrBeyond(): boolean {
    return (
      this.status === OrderStatus.PAID ||
      this.status === OrderStatus.SHIPPED ||
      this.status === OrderStatus.DELIVERED
    );
  }

  public markPaid(): void {
    if (this.status === OrderStatus.PAID) {
      return;
    }
    if (this.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BusinessRuleViolationException(
        `Cannot transition order ${this.id} from ${this.status} to PAID`,
      );
    }
    this.status = OrderStatus.PAID;
  }

  public markPaymentFailed(): boolean {
    if (this.isPaidOrBeyond()) {
      // Guard against out-of-order payment.failed webhook overwriting a PAID/SHIPPED/DELIVERED order
      return false;
    }
    if (this.status === OrderStatus.PAYMENT_FAILED) {
      return false;
    }
    this.status = OrderStatus.PAYMENT_FAILED;
    return true;
  }

  public markShipped(): void {
    if (this.status === OrderStatus.SHIPPED) {
      return;
    }
    if (
      this.status !== OrderStatus.PAID &&
      this.status !== OrderStatus.PENDING_PAYMENT
    ) {
      throw new BusinessRuleViolationException(
        `Cannot transition order ${this.id} from ${this.status} to SHIPPED`,
      );
    }
    this.status = OrderStatus.SHIPPED;
  }

  public markDelivered(): void {
    if (this.status === OrderStatus.DELIVERED) {
      return;
    }
    if (
      this.status !== OrderStatus.SHIPPED &&
      this.status !== OrderStatus.PAID
    ) {
      throw new BusinessRuleViolationException(
        `Cannot transition order ${this.id} from ${this.status} to DELIVERED`,
      );
    }
    this.status = OrderStatus.DELIVERED;
  }
}
