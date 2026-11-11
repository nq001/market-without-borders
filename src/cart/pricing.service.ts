import { Injectable } from '@nestjs/common';
import { CartItem } from '../database/entities/cart-item.entity';
import { Coupon } from '../database/entities/coupon.entity';
import { BusinessRuleViolationException } from '../common/domain/domain-exception.base';
import { Money } from '../common/domain/money.vo';

export interface PricingResult {
  subtotal: number;
  discount: number;
  total: number;
}

@Injectable()
export class PricingService {
  calculateTotal(cartItems: CartItem[], coupon: Coupon | null): PricingResult {
    let subtotalMoney = Money.zero();

    for (const item of cartItems) {
      if (!item.product) {
        throw new BusinessRuleViolationException(
          'Product data is missing from cart item',
        );
      }
      if (!item.product.is_active) {
        throw new BusinessRuleViolationException(
          `Product ${item.product.name} is currently inactive`,
        );
      }
      if (item.quantity <= 0) {
        throw new BusinessRuleViolationException(
          `Invalid quantity for product ${item.product.name}`,
        );
      }

      const lineTotal = Money.fromMinorUnits(item.product.price).multiply(
        item.quantity,
      );
      subtotalMoney = subtotalMoney.add(lineTotal);
    }

    const subtotal = subtotalMoney.amount;
    let discount = 0;

    if (coupon) {
      if (typeof coupon.calculateDiscount === 'function') {
        discount = coupon.calculateDiscount(subtotal);
      } else {
        if (coupon.expires_at && new Date() > new Date(coupon.expires_at)) {
          throw new BusinessRuleViolationException('Coupon is expired');
        }
        if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
          throw new BusinessRuleViolationException(
            'Coupon usage limit reached',
          );
        }
        if (coupon.discount_type === 'PERCENTAGE') {
          discount = Math.floor(subtotal * (coupon.discount_amount / 100));
        } else if (coupon.discount_type === 'FIXED') {
          discount = coupon.discount_amount;
        }
        if (discount > subtotal) {
          discount = subtotal;
        }
      }
    }

    const total = subtotalMoney.subtract(Money.fromMinorUnits(discount)).amount;

    return {
      subtotal,
      discount,
      total,
    };
  }
}
