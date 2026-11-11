import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Cart } from '../database/entities/cart.entity';
import { CartItem } from '../database/entities/cart-item.entity';
import { PricingService, PricingResult } from './pricing.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { ProductsService } from '../catalog/products/products.service';
import { CouponsService } from '../coupons/coupons.service';
import {
  BusinessRuleViolationException,
  EntityNotFoundDomainException,
} from '../common/domain/domain-exception.base';

export interface CartResponse {
  cart: Cart;
  pricing: PricingResult;
}

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productsService: ProductsService,
    private readonly couponsService: CouponsService,
    private readonly pricingService: PricingService,
  ) {}

  private async getOrCreateCartEntity(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user_id: userId },
      relations: ['cartItems', 'cartItems.product', 'coupon'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ user_id: userId });
      cart = await this.cartRepository.save(cart);
      cart.cartItems = [];
    }

    return cart;
  }

  async getCartAndPricing(userId: string): Promise<CartResponse> {
    const cart = await this.getOrCreateCartEntity(userId);
    const pricing = this.pricingService.calculateTotal(
      cart.cartItems,
      cart.coupon || null,
    );

    return { cart, pricing };
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<CartResponse> {
    if (dto.quantity <= 0) {
      throw new BusinessRuleViolationException(
        'Quantity must be greater than 0',
      );
    }

    const cart = await this.getOrCreateCartEntity(userId);

    const product = await this.productsService.findActiveById(dto.product_id);
    if (!product || !product.is_active) {
      throw new BusinessRuleViolationException(
        'Product is invalid or inactive',
      );
    }

    let item = await this.cartItemRepository.findOne({
      where: { cart_id: cart.id, product_id: dto.product_id },
    });

    if (item) {
      item.quantity += dto.quantity;
      await this.cartItemRepository.save(item);
    } else {
      item = this.cartItemRepository.create({
        cart_id: cart.id,
        product_id: dto.product_id,
        quantity: dto.quantity,
      });
      await this.cartItemRepository.save(item);
    }

    return this.getCartAndPricing(userId);
  }

  async updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartResponse> {
    if (quantity < 1) {
      throw new BusinessRuleViolationException(
        'Quantity must be greater than 0',
      );
    }

    const cart = await this.getOrCreateCartEntity(userId);

    const item = await this.cartItemRepository.findOne({
      where: { cart_id: cart.id, product_id: productId },
    });

    if (!item) {
      throw new EntityNotFoundDomainException('Item not found in cart');
    }

    item.quantity = quantity;
    await this.cartItemRepository.save(item);

    return this.getCartAndPricing(userId);
  }

  async removeItem(userId: string, productId: string): Promise<CartResponse> {
    const cart = await this.getOrCreateCartEntity(userId);

    const item = await this.cartItemRepository.findOne({
      where: { cart_id: cart.id, product_id: productId },
    });

    if (!item) {
      throw new EntityNotFoundDomainException('Item not found in cart');
    }

    await this.cartItemRepository.remove(item);

    return this.getCartAndPricing(userId);
  }

  async applyCoupon(
    userId: string,
    dto: ApplyCouponDto,
  ): Promise<CartResponse> {
    const cart = await this.getOrCreateCartEntity(userId);

    const coupon = await this.couponsService.findByCode(dto.code);

    // Will throw if coupon is invalid/expired
    this.pricingService.calculateTotal(cart.cartItems, coupon);

    cart.coupon_id = coupon.id;
    cart.coupon = coupon;
    await this.cartRepository.save(cart);

    return this.getCartAndPricing(userId);
  }

  async removeCoupon(userId: string): Promise<CartResponse> {
    const cart = await this.getOrCreateCartEntity(userId);

    cart.coupon_id = null;
    cart.coupon = null;
    await this.cartRepository.save(cart);

    return this.getCartAndPricing(userId);
  }

  async clearCart(cart: Cart, manager?: EntityManager): Promise<void> {
    if (manager) {
      if (cart.cartItems && cart.cartItems.length > 0) {
        await manager.remove(cart.cartItems);
      }
      cart.coupon_id = null;
      cart.coupon = null;
      await manager.save(cart);
      return;
    }

    if (cart.cartItems && cart.cartItems.length > 0) {
      await this.cartItemRepository.remove(cart.cartItems);
    }
    cart.coupon_id = null;
    cart.coupon = null;
    await this.cartRepository.save(cart);
  }
}
