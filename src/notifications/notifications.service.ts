import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../database/entities/notification.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NOTIFICATION_SENDER_PORT } from './application/ports/notification-sender.port';
import type { INotificationSenderPort } from './application/ports/notification-sender.port';

@Injectable()
export class NotificationsService implements OnModuleDestroy {
  private readonly logger = new Logger(NotificationsService.name);
  private isProcessing = false;
  private isShuttingDown = false;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @Optional()
    @Inject(NOTIFICATION_SENDER_PORT)
    private readonly notificationSender?: INotificationSenderPort,
  ) {}

  onModuleDestroy(): void {
    this.isShuttingDown = true;
  }

  @OnEvent('order.paid')
  async handleOrderPaid(payload: { orderId: string; userId?: string }) {
    this.logger.log(`Queueing ORDER_CONFIRMATION for order ${payload.orderId}`);

    const notification = this.notificationRepo.create({
      user_id: payload.userId || '00000000-0000-0000-0000-000000000000',
      type: 'ORDER_CONFIRMATION',
      payload: { orderId: payload.orderId },
      status: 'PENDING',
    });

    await this.notificationRepo.save(notification);
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    if (this.isShuttingDown || process.env.NODE_ENV === 'test') {
      return;
    }
    await this.processPendingNotifications();
  }

  async processPendingNotifications() {
    if (this.isProcessing || this.isShuttingDown) {
      return;
    }

    this.isProcessing = true;
    try {
      const pending = await this.notificationRepo.find({
        where: { status: 'PENDING' },
        take: 50,
      });

      if (pending.length === 0) return;

      this.logger.log(`Processing ${pending.length} pending notifications...`);

      for (const notif of pending) {
        try {
          if (this.notificationSender) {
            await this.notificationSender.send(notif);
          } else {
            await this.simulateSend(notif);
          }

          notif.status = 'DELIVERED';
          await this.notificationRepo.save(notif);
          this.logger.log(`Delivered notification ${notif.id}`);
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Failed to deliver notification ${notif.id}: ${message}`,
          );
          notif.status = 'FAILED';
          notif.error_message = message;
          await this.notificationRepo.save(notif);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async simulateSend(_notif: Notification) {
    return new Promise((resolve) => setTimeout(resolve, 10));
  }
}
