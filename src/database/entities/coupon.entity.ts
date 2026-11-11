import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from './order.entity';
import { BusinessRuleViolationException } from '../../common/domain/domain-exception.base';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column('int')
  discount_amount: number;

  @Column()
  discount_type: string; // 'PERCENTAGE' or 'FIXED'

  @Column('int', { nullable: true })
  usage_limit: number;

  @Column('int', { default: 0 })
  times_used: number;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @OneToMany(() => Order, (order) => order.coupon)
  orders: Order[];

  // --- Rich Domain Behavior ---

  public validateApplicable(now: Date = new Date()): void {
    if (this.expires_at && now > new Date(this.expires_at)) {
      throw new BusinessRuleViolationException('Coupon is expired');
    }

    if (this.usage_limit && this.times_used >= this.usage_limit) {
      throw new BusinessRuleViolationException('Coupon usage limit reached');
    }
  }

  public calculateDiscount(subtotal: number, now: Date = new Date()): number {
    this.validateApplicable(now);

    let discount = 0;
    if (this.discount_type === 'PERCENTAGE') {
      discount = Math.floor(subtotal * (this.discount_amount / 100));
    } else if (this.discount_type === 'FIXED') {
      discount = this.discount_amount;
    }

    return Math.min(discount, subtotal);
  }

  public incrementUsage(now: Date = new Date()): void {
    this.validateApplicable(now);
    this.times_used = (this.times_used || 0) + 1;
  }
}
