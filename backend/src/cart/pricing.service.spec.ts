import { Test, TestingModule } from '@nestjs/testing';
import { PricingService } from './pricing.service';
import { CartItem } from '../database/entities/cart-item.entity';
import { Product } from '../database/entities/product.entity';
import { Coupon } from '../database/entities/coupon.entity';
import { BadRequestException } from '@nestjs/common';

describe('PricingService', () => {
  let service: PricingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PricingService],
    }).compile();

    service = module.get<PricingService>(PricingService);
  });

  const mockProduct = (price: number, isActive = true): Product => {
    const p = new Product();
    p.price = price;
    p.is_active = isActive;
    p.name = 'Test Product';
    return p;
  };

  const mockCartItem = (quantity: number, product: Product): CartItem => {
    const item = new CartItem();
    item.quantity = quantity;
    item.product = product;
    return item;
  };

  const mockCoupon = (
    type: 'PERCENTAGE' | 'FIXED',
    amount: number,
    expiresAt?: Date,
    timesUsed = 0,
    usageLimit?: number,
  ): Coupon => {
    const c = new Coupon();
    c.discount_type = type;
    c.discount_amount = amount;
    c.expires_at = expiresAt as Date;
    c.times_used = timesUsed;
    c.usage_limit = usageLimit as number;
    return c;
  };

  it('should calculate subtotal correctly without coupon', () => {
    const items = [
      mockCartItem(2, mockProduct(100)), // 200
      mockCartItem(1, mockProduct(50)), // 50
    ];

    const result = service.calculateTotal(items, null);
    expect(result.subtotal).toBe(250);
    expect(result.discount).toBe(0);
    expect(result.total).toBe(250);
  });

  it('should throw BadRequestException if product is inactive', () => {
    const items = [mockCartItem(1, mockProduct(100, false))];
    expect(() => service.calculateTotal(items, null)).toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException if quantity <= 0', () => {
    const items = [mockCartItem(0, mockProduct(100))];
    expect(() => service.calculateTotal(items, null)).toThrow(
      BadRequestException,
    );
  });

  it('should apply PERCENTAGE discount correctly', () => {
    const items = [mockCartItem(1, mockProduct(1000))];
    const coupon = mockCoupon('PERCENTAGE', 10); // 10%
    const result = service.calculateTotal(items, coupon);
    expect(result.subtotal).toBe(1000);
    expect(result.discount).toBe(100);
    expect(result.total).toBe(900);
  });

  it('should apply FIXED discount correctly', () => {
    const items = [mockCartItem(1, mockProduct(500))];
    const coupon = mockCoupon('FIXED', 150);
    const result = service.calculateTotal(items, coupon);
    expect(result.subtotal).toBe(500);
    expect(result.discount).toBe(150);
    expect(result.total).toBe(350);
  });

  it('should not discount more than subtotal', () => {
    const items = [mockCartItem(1, mockProduct(100))];
    const coupon = mockCoupon('FIXED', 500);
    const result = service.calculateTotal(items, coupon);
    expect(result.subtotal).toBe(100);
    expect(result.discount).toBe(100);
    expect(result.total).toBe(0);
  });

  it('should throw if coupon is expired', () => {
    const items = [mockCartItem(1, mockProduct(100))];
    const expiredDate = new Date(Date.now() - 10000);
    const coupon = mockCoupon('FIXED', 50, expiredDate);
    expect(() => service.calculateTotal(items, coupon)).toThrow(
      'Coupon is expired',
    );
  });

  it('should throw if coupon usage limit reached', () => {
    const items = [mockCartItem(1, mockProduct(100))];
    const coupon = mockCoupon('FIXED', 50, undefined, 5, 5); // Used 5 times, limit 5
    expect(() => service.calculateTotal(items, coupon)).toThrow(
      'Coupon usage limit reached',
    );
  });
});
