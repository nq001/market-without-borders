import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditLog } from '../database/entities/audit-log.entity';

const SYSTEM_ACTOR_UUID = '00000000-0000-0000-0000-000000000000';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  async logAction(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    changes?: Record<string, unknown>,
    ipAddress?: string,
  ): Promise<AuditLog> {
    this.logger.log(
      `AUDIT: User ${userId} performed ${action} on ${entityType} ${entityId}`,
    );

    const log = this.auditLogRepo.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      changes: changes ?? {},
      ip_address: ipAddress,
    });

    return this.auditLogRepo.save(log);
  }

  @OnEvent('order.placed')
  async onOrderPlaced(payload: {
    orderId: string;
    userId?: string;
    totalAmount?: number;
  }) {
    try {
      await this.logAction(
        payload.userId || SYSTEM_ACTOR_UUID,
        'ORDER_PLACED',
        'Order',
        payload.orderId,
        { totalAmount: payload.totalAmount },
      );
    } catch (err) {
      this.logger.warn(`Failed to write audit log for order.placed: ${err}`);
    }
  }

  @OnEvent('order.paid')
  async onOrderPaid(payload: {
    orderId: string;
    userId?: string;
    paymentEventId?: string;
  }) {
    try {
      await this.logAction(
        payload.userId || SYSTEM_ACTOR_UUID,
        'ORDER_PAID',
        'Order',
        payload.orderId,
        { paymentEventId: payload.paymentEventId },
      );
    } catch (err) {
      this.logger.warn(`Failed to write audit log for order.paid: ${err}`);
    }
  }

  @OnEvent('order.cancelled')
  async onOrderCancelled(payload: {
    orderId: string;
    userId?: string;
    reason?: string;
  }) {
    try {
      await this.logAction(
        payload.userId || SYSTEM_ACTOR_UUID,
        'ORDER_CANCELLED',
        'Order',
        payload.orderId,
        { reason: payload.reason },
      );
    } catch (err) {
      this.logger.warn(`Failed to write audit log for order.cancelled: ${err}`);
    }
  }
}
