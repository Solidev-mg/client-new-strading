import {
  CreateNotificationRequest,
  Notification,
  NotificationFilter,
  NotificationPreferences,
} from "../entities/notification.entity";

export interface NotificationRepository {
  getNotifications(filter?: NotificationFilter): Promise<Notification[]>;
  getNotificationById(id: string): Promise<Notification | null>;
  createNotification(
    notificationData: CreateNotificationRequest
  ): Promise<Notification>;
  markAsRead(id: string): Promise<boolean>;
  markAllAsRead(userId: string): Promise<boolean>;
  deleteNotification(id: string): Promise<boolean>;
  getUnreadCount(userId: string): Promise<number>;
  getNotificationPreferences(userId: string): Promise<NotificationPreferences>;
  updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences>;
}
