import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../database/entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { NOTIFICATION_SENDER_PORT } from './application/ports/notification-sender.port';
import { ConsoleEmailNotificationAdapter } from './infrastructure/adapters/console-email.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [
    ConsoleEmailNotificationAdapter,
    {
      provide: NOTIFICATION_SENDER_PORT,
      useExisting: ConsoleEmailNotificationAdapter,
    },
    NotificationsService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
