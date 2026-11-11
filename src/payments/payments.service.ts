import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import { PaymentEvent } from '../database/entities/payment-event.entity';
import { Order, OrderStatus } from '../database/entities/order.entity';
import { OrdersService } from '../orders/orders.service';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import {
  BusinessRuleViolationException,
  EntityNotFoundDomainException,
  UnauthorizedDomainException,
  isUniqueConstraintError,
} from '../common/domain/domain-exception.base';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(PaymentEvent)
    private readonly paymentEventRepo: Repository<PaymentEvent>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    @Optional()
    private readonly ordersService?: OrdersService,
    @Optional()
    private readonly configService?: ConfigService,
  ) {}

  verifyWebhookSignature(rawPayload: unknown, signature?: string): void {
    const secret = this.configService?.get<string>('PAYMENT_WEBHOOK_SECRET');
    const requireSig =
      this.configService?.get<string>('WEBHOOK_REQUIRE_SIGNATURE') === 'true';

    if (!signature && !requireSig) {
      return;
    }

    if (!signature || !secret) {
      throw new UnauthorizedDomainException(
        'Missing or invalid payment webhook signature',
      );
    }

    const expected = crypto
      .createHmac('sha256', secret)
      .update(
        typeof rawPayload === 'string'
          ? rawPayload
          : JSON.stringify(rawPayload),
      )
      .digest('hex');

    const sigBuffer = Buffer.from(signature);
    const expBuffer = Buffer.from(expected);
    if (
      sigBuffer.length !== expBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expBuffer)
    ) {
      throw new UnauthorizedDomainException(
        'Invalid payment webhook signature',
      );
    }
  }

  async handleWebhook(payload: PaymentWebhookDto) {
    if (!payload || !payload.data) {
      throw new BusinessRuleViolationException(
        'Invalid webhook payload: missing data object',
      );
    }

    const event_id = payload.event_id;
    const type = payload.type ?? payload.event_type;
    const { order_id, amount } = payload.data;

    if (!event_id || !type || !order_id) {
      throw new BusinessRuleViolationException(
        'Invalid webhook payload: event_id, type, and data.order_id are required',
      );
    }

    this.logger.log(`Received webhook ${event_id} for order ${order_id}`);

    const event = this.paymentEventRepo.create({
      provider_event_id: event_id,
      order_id,
      provider_status: type,
      internal_status: 'PROCESSING',
      amount,
    });

    try {
      await this.paymentEventRepo.save(event);
    } catch (error: unknown) {
      if (isUniqueConstraintError(error)) {
        this.logger.warn(`Duplicate webhook received: ${event_id}. Ignoring.`);
        return { status: 'ignored_duplicate' };
      }
      throw error;
    }

    await this.dataSource.transaction(async (manager) => {
      if (this.ordersService) {
        if (type === 'payment.succeeded') {
          const { order, transitioned } =
            await this.ordersService.confirmOrderPayment(
              order_id,
              amount,
              manager,
            );
          if (!transitioned) {
            this.logger.warn(
              `Order ${order_id} is in state ${order.status}, ignoring success webhook`,
            );
            return;
          }

          event.internal_status = 'PROCESSED';
          await manager.save(event);

          this.eventEmitter.emit('order.paid', {
            orderId: order.id,
            userId: order.user_id,
            paymentEventId: event_id,
          });
        } else if (type === 'payment.failed') {
          const { order, transitioned } =
            await this.ordersService.failOrderPayment(order_id, manager);
          event.internal_status = 'PROCESSED';
          await manager.save(event);

          if (transitioned) {
            this.eventEmitter.emit('order.cancelled', {
              orderId: order.id,
              userId: order.user_id,
              reason: 'PAYMENT_FAILED',
            });
          }
        }
        return;
      }

      // Fallback when OrdersService is not injected in isolated unit tests
      const order = await manager.findOne(Order, { where: { id: order_id } });
      if (!order) {
        throw new EntityNotFoundDomainException(`Order ${order_id} not found`);
      }

      if (type === 'payment.succeeded') {
        if (order.status !== OrderStatus.PENDING_PAYMENT) {
          this.logger.warn(
            `Order ${order_id} is in state ${order.status}, ignoring success webhook`,
          );
          return;
        }

        order.status = OrderStatus.PAID;
        await manager.save(order);

        event.internal_status = 'PROCESSED';
        await manager.save(event);

        this.eventEmitter.emit('order.paid', {
          orderId: order.id,
          userId: order.user_id,
        });
      } else if (type === 'payment.failed') {
        if (
          order.status !== OrderStatus.PAID &&
          order.status !== OrderStatus.SHIPPED &&
          order.status !== OrderStatus.DELIVERED
        ) {
          order.status = OrderStatus.PAYMENT_FAILED;
          await manager.save(order);
        }

        event.internal_status = 'PROCESSED';
        await manager.save(event);
      }
    });

    return { status: 'processed' };
  }
}
