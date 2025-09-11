import {
  CreateNotificationRequest,
  Notification,
  NotificationFilter,
  NotificationPreferences,
} from "../entities/notification.entity";
import { NotificationRepository } from "../repositories/notification.repository";

export class GetNotificationsUsecase {
  constructor(
    private readonly notificationRepository: NotificationRepository
  ) {}

  async execute(filter?: NotificationFilter): Promise<Notification[]> {
    return this.notificationRepository.getNotifications(filter);
  }
}

export class GetNotificationByIdUsecase {
  constructor(
    private readonly notificationRepository: NotificationRepository
  ) {}

  async execute(id: string): Promise<Notification | null> {
    return this.notificationRepository.getNotificationById(id);
  }
}

export class CreateNotificationUsecase {
  constructor(
    private readonly notificationRepository: NotificationRepository
  ) {}

  async execute(
    notificationData: CreateNotificationRequest
  ): Promise<Notification> {
    return this.notificationRepository.createNotification(notificationData);
  }
}

export class MarkAsReadUsecase {
  constructor(
    private readonly notificationRepository: NotificationRepository
  ) {}

  async execute(id: string): Promise<boolean> {
    return this.notificationRepository.markAsRead(id);
  }
}

export class MarkAllAsReadUsecase {
  constructor(
    private readonly notificationRepository: NotificationRepository
  ) {}

  async execute(userId: string): Promise<boolean> {
    return this.notificationRepository.markAllAsRead(userId);
  }
}

export class GetUnreadCountUsecase {
  constructor(
    private readonly notificationRepository: NotificationRepository
  ) {}

  async execute(userId: string): Promise<number> {
    return this.notificationRepository.getUnreadCount(userId);
  }
}

export class GetNotificationPreferencesUsecase {
  constructor(
    private readonly notificationRepository: NotificationRepository
  ) {}

  async execute(userId: string): Promise<NotificationPreferences> {
    return this.notificationRepository.getNotificationPreferences(userId);
  }
}

export class UpdateNotificationPreferencesUsecase {
  constructor(
    private readonly notificationRepository: NotificationRepository
  ) {}

  async execute(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    return this.notificationRepository.updateNotificationPreferences(
      userId,
      preferences
    );
  }
}
