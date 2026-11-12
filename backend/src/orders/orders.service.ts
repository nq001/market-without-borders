import { Injectable, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order, OrderStatus } from '../database/entities/order.entity';
import { OrderItem } from '../database/entities/order-item.entity';
import { OrderAddressSnapshot } from '../database/entities/order-address-snapshot.entity';
import { IdempotencyKey } from '../database/entities/idempotency-key.entity';
import { CartService } from '../cart/cart.service';
import { InventoryService } from '../inventory/inventory.service';
import { CouponsService } from '../coupons/coupons.service';
import { CheckoutDto } from './dto/checkout.dto';
import {
  BusinessRuleViolationException,
  ConflictDomainException,
  EntityNotFoundDomainException,
  isUniqueConstraintError,
} from '../common/domain/domain-exception.base';
import { IVerifiedPurchasePort } from './application/ports/verified-purchase.port';
import * as crypto from 'crypto';

@Injectable()
export class OrdersService implements IVerifiedPurchasePort {
  constructor(
    @InjectRepository(IdempotencyKey)
    private readonly idempotencyRepo: Repository<IdempotencyKey>,
    private readonly cartService: CartService,
    private readonly inventoryService: InventoryService,
    private readonly dataSource: DataSource,
    @Optional()
    private readonly couponsService?: CouponsService,
    @Optional()
    private readonly eventEmitter?: EventEmitter2,
  ) {}

  async checkout(
    userId: string,
    dto: CheckoutDto,
    path: string = '',
  ): Promise<Order> {
    // 1. Idempotency Check
    const existingKey = await this.idempotencyRepo.findOne({
      where: { user_id: userId, key: dto.idempotency_key },
    });

    if (existingKey) {
      if (existingKey.response_body) {
        return existingKey.response_body as unknown as Order;
      }
      throw new ConflictDomainException(
        'Request with this idempotency key is already in progress',
      );
    }

    // 2. Fetch Cart
    const { cart, pricing } = await this.cartService.getCartAndPricing(userId);

    if (!cart.cartItems || cart.cartItems.length === 0) {
      throw new BusinessRuleViolationException('Cart is empty');
    }

    // 3. Register Idempotency Key (in-progress)
    let idempotencyRecord = this.idempotencyRepo.create({
      user_id: userId,
      key: dto.idempotency_key,
      request_path: path || '',
    });
    try {
      idempotencyRecord = await this.idempotencyRepo.save(idempotencyRecord);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictDomainException(
          'Request with this idempotency key is already in progress',
        );
      }
      throw error;
    }

    const orderId = crypto.randomUUID();
    let inventoryReserved = false;

    try {
      // 4. Reserve Inventory (Throws ConflictException if fails)
      const reserveItems = cart.cartItems.map((item) => ({
        productId: item.product_id,
        quantity: item.quantity,
      }));
      await this.inventoryService.reserveInventory(reserveItems, orderId);
      inventoryReserved = true;

      // 5. Transactional Order Creation
      const order = await this.dataSource.transaction(async (manager) => {
        if (cart.coupon_id && this.couponsService) {
          await this.couponsService.redeemCoupon(cart.coupon_id, manager);
        }

        // Determine primary or first store from cart items
        const primaryStoreId = cart.cartItems.find(i => i.product?.store_id)?.product?.store_id || null;

        const newOrder = manager.create(Order, {
          id: orderId,
          user_id: userId,
          store_id: primaryStoreId,
          coupon_id: cart.coupon_id,
          status: OrderStatus.PENDING_PAYMENT,
          subtotal_amount: pricing.subtotal,
          discount_amount: pricing.discount,
          total_amount: pricing.total,
        });
        await manager.save(newOrder);

        // Multi-Store Split: Check if cart items belong to multiple stores
        const itemsByStore: Record<string, typeof cart.cartItems> = {};
        for (const it of cart.cartItems) {
          const sId = it.product?.store_id || 'unassigned';
          if (!itemsByStore[sId]) itemsByStore[sId] = [];
          itemsByStore[sId].push(it);
        }

        const storeKeys = Object.keys(itemsByStore);
        if (storeKeys.length > 1) {
          for (const sId of storeKeys) {
            if (sId === 'unassigned') continue;
            const subItems = itemsByStore[sId];
            const subSubtotal = subItems.reduce((acc, cur) => acc + cur.product.price * cur.quantity, 0);

            const childOrder = manager.create(Order, {
              user_id: userId,
              store_id: sId,
              parent_order_id: orderId,
              coupon_id: null,
              status: OrderStatus.PENDING_PAYMENT,
              subtotal_amount: subSubtotal,
              discount_amount: 0,
              total_amount: subSubtotal,
            });
            await manager.save(childOrder);

            for (const item of subItems) {
              const childOrderItem = manager.create(OrderItem, {
                order_id: childOrder.id,
                product_id: item.product_id,
                product_name_snapshot: item.product.name,
                sku_snapshot: item.product.sku,
                unit_price_snapshot: item.product.price,
                quantity: item.quantity,
                line_total: item.product.price * item.quantity,
              });
              await manager.save(childOrderItem);
            }
          }
        }

        for (const item of cart.cartItems) {
          const orderItem = manager.create(OrderItem, {
            order_id: orderId,
            product_id: item.product_id,
            product_name_snapshot: item.product.name,
            sku_snapshot: item.product.sku,
            unit_price_snapshot: item.product.price,
            quantity: item.quantity,
            line_total: item.product.price * item.quantity,
          });
          await manager.save(orderItem);
        }

        const address = manager.create(OrderAddressSnapshot, {
          order_id: orderId,
          full_name: dto.full_name,
          phone: dto.phone,
          country: dto.country,
          city: dto.city,
          street: dto.street,
          postal_code: dto.postal_code,
        });
        await manager.save(address);

        if (typeof this.cartService.clearCart === 'function') {
          await this.cartService.clearCart(cart, manager);
        } else {
          if (cart.cartItems.length > 0) {
            await manager.remove(cart.cartItems);
          }
          cart.coupon_id = null;
          cart.coupon = null;
          await manager.save(cart);
        }

        return newOrder;
      });

      // 6. Complete Idempotency
      idempotencyRecord.response_body = order as unknown as Record<
        string,
        unknown
      >;
      await this.idempotencyRepo.save(idempotencyRecord);

      if (this.eventEmitter) {
        this.eventEmitter.emit('order.placed', {
          orderId: order.id,
          userId: order.user_id,
          totalAmount: order.total_amount,
        });
      }

      return order;
    } catch (error) {
      if (inventoryReserved) {
        await this.inventoryService.releaseInventory(orderId);
      }

      await this.idempotencyRepo.remove(idempotencyRecord);
      throw error;
    }
  }

  async confirmOrderPayment(
    orderId: string,
    amount?: number,
    manager?: EntityManager,
  ): Promise<{ order: Order; transitioned: boolean }> {
    const run = async (em: EntityManager) => {
      const order = await em.findOne(Order, { where: { id: orderId } });
      if (!order) {
        throw new EntityNotFoundDomainException(`Order ${orderId} not found`);
      }

      if (
        amount !== undefined &&
        order.total_amount !== undefined &&
        Number(amount) !== Number(order.total_amount)
      ) {
        throw new BusinessRuleViolationException(
          `Payment amount (${amount}) does not match order total (${order.total_amount})`,
        );
      }

      if (order.status !== OrderStatus.PENDING_PAYMENT) {
        return { order, transitioned: false };
      }

      if (typeof order.markPaid === 'function') {
        order.markPaid();
      } else {
        order.status = OrderStatus.PAID;
      }

      await em.save(order);
      await this.inventoryService.deductInventory(orderId, em);

      return { order, transitioned: true };
    };

    return manager ? run(manager) : this.dataSource.transaction(run);
  }

  async failOrderPayment(
    orderId: string,
    manager?: EntityManager,
  ): Promise<{ order: Order; transitioned: boolean }> {
    const run = async (em: EntityManager) => {
      const order = await em.findOne(Order, { where: { id: orderId } });
      if (!order) {
        throw new EntityNotFoundDomainException(`Order ${orderId} not found`);
      }

      let transitioned = false;
      if (typeof order.markPaymentFailed === 'function') {
        transitioned = order.markPaymentFailed();
      } else if (order.status === OrderStatus.PENDING_PAYMENT) {
        order.status = OrderStatus.PAYMENT_FAILED;
        transitioned = true;
      }

      if (transitioned) {
        await em.save(order);
        await this.inventoryService.releaseInventory(orderId, em);
      }

      return { order, transitioned };
    };

    return manager ? run(manager) : this.dataSource.transaction(run);
  }

  async markOrderShipped(
    orderId: string,
    manager?: EntityManager,
  ): Promise<void> {
    const run = async (em: EntityManager) => {
      const order = await em.findOne(Order, { where: { id: orderId } });
      if (!order) return;
      if (typeof order.markShipped === 'function') {
        order.markShipped();
      } else {
        order.status = OrderStatus.SHIPPED;
      }
      await em.save(order);
    };

    if (manager) {
      await run(manager);
    } else {
      await this.dataSource.transaction(run);
    }
  }

  async markOrderDelivered(
    orderId: string,
    manager?: EntityManager,
  ): Promise<void> {
    const run = async (em: EntityManager) => {
      const order = await em.findOne(Order, { where: { id: orderId } });
      if (!order) return;
      if (typeof order.markDelivered === 'function') {
        order.markDelivered();
      } else {
        order.status = OrderStatus.DELIVERED;
      }
      await em.save(order);
    };

    if (manager) {
      await run(manager);
    } else {
      await this.dataSource.transaction(run);
    }
  }

  async hasUserPurchasedProduct(
    userId: string,
    productId: string,
  ): Promise<boolean> {
    const orderRepo = this.dataSource.getRepository(Order);
    return orderRepo
      .createQueryBuilder('order')
      .innerJoin('order.orderItems', 'item')
      .where('order.user_id = :userId', { userId })
      .andWhere('item.product_id = :productId', { productId })
      .andWhere('order.status IN (:...statuses)', {
        statuses: [
          OrderStatus.PAID,
          OrderStatus.SHIPPED,
          OrderStatus.DELIVERED,
        ],
      })
      .getExists();
  }
}
