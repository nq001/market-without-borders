import { Injectable, Logger } from '@nestjs/common';
import { Notification } from '../../../database/entities/notification.entity';
import { INotificationSenderPort } from '../../application/ports/notification-sender.port';

@Injectable()
export class ConsoleEmailNotificationAdapter implements INotificationSenderPort {
  private readonly logger = new Logger(ConsoleEmailNotificationAdapter.name);

  async send(notification: Notification): Promise<void> {
    this.logger.log(
      `Dispatching ${notification.type} notification ${notification.id} to user ${notification.user_id}`,
    );
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

