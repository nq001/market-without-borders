import { EntityManager } from 'typeorm';
import { Coupon } from '../../../database/entities/coupon.entity';

export const COUPON_PORT = 'COUPON_PORT';

export interface ICouponPort {
  findByCode(code: string): Promise<Coupon>;
  redeemCoupon(couponId: string, manager?: EntityManager): Promise<void>;
}

