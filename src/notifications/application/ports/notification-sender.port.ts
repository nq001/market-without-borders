import { Notification } from '../../../database/entities/notification.entity';

export const NOTIFICATION_SENDER_PORT = 'NOTIFICATION_SENDER_PORT';

export interface INotificationSenderPort {
  send(notification: Notification): Promise<void>;
}

