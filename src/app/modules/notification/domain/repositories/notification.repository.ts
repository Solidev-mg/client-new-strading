import {
  CreateNotificationRequest,
  Notification,
  NotificationFilter,
  NotificationPaginatedResponse,
  NotificationPreferences,
} from "../entities/notification.entity";

export interface NotificationRepository {
  getNotifications(filter?: NotificationFilter): Promise<Notification[]>;
  getNotificationsPaginated(
    filter?: NotificationFilter
  ): Promise<NotificationPaginatedResponse>;
  getNotificationById(id: string): Promise<Notification | null>;
  createNotification(
    notificationData: CreateNotificationRequest
  ): Promise<Notification>;
  markAsRead(id: number): Promise<Notification>;
  markAllAsRead(userId: string): Promise<void>;
  deleteNotification(id: number): Promise<void>;
  getUnreadCount(): Promise<number>;
  getNotificationPreferences(userId: string): Promise<NotificationPreferences>;
  updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences>;
}
