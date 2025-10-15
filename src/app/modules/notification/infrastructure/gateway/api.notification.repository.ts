import apiClient from "@/services/api";
import {
  CreateNotificationRequest,
  Notification,
  NotificationFilter,
  NotificationPreferences,
} from "../../domain/entities/notification.entity";
import { NotificationRepository } from "../../domain/repositories/notification.repository";

export class ApiNotificationRepository implements NotificationRepository {
  private mapNotificationData(data: Record<string, unknown>): Notification {
    return {
      id: data.id as number,
      userId: data.userId as string,
      title: data.title as string,
      message: data.message as string,
      eventType: data.eventType as string,
      priority: data.priority as string,
      status: data.status as string,
      channels: (data.channels as string[]) || [],
      packageId: data.packageId as string | null,
      trackingCode: data.trackingCode as string | null,
      metadata: data.metadata as Record<string, unknown> | null,
      isRead: data.status === "read" || data.readAt !== null,
      createdAt: new Date(data.createdAt as string),
      updatedAt: new Date(data.updatedAt as string),
      scheduledAt: data.scheduledAt
        ? new Date(data.scheduledAt as string)
        : null,
      sentAt: data.sentAt ? new Date(data.sentAt as string) : null,
      readAt: data.readAt ? new Date(data.readAt as string) : null,
    };
  }

  async getNotifications(filter?: NotificationFilter): Promise<Notification[]> {
    try {
      const queryParams = new URLSearchParams();

      if (filter?.isRead !== undefined) {
        queryParams.append("isRead", filter.isRead.toString());
      }
      if (filter?.type) {
        queryParams.append("type", filter.type);
      }
      if (filter?.dateFrom) {
        queryParams.append("dateFrom", filter.dateFrom.toISOString());
      }
      if (filter?.dateTo) {
        queryParams.append("dateTo", filter.dateTo.toISOString());
      }

      const response = await apiClient.get(
        `/notifications?${queryParams.toString()}`
      );
      const notifications = Array.isArray(response.data)
        ? response.data
        : response.data.notifications || [];
      return notifications.map((notification: Record<string, unknown>) =>
        this.mapNotificationData(notification)
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  async getNotificationById(id: string): Promise<Notification | null> {
    try {
      const response = await apiClient.get(`/notifications/${id}`);
      return response.data ? this.mapNotificationData(response.data) : null;
    } catch (error) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status: number } };
        if (axiosError.response?.status === 404) {
          return null;
        }
      }
      console.error("Error fetching notification:", error);
      throw error;
    }
  }

  async createNotification(
    notificationData: CreateNotificationRequest
  ): Promise<Notification> {
    try {
      const response = await apiClient.post("/notifications", notificationData);
      return this.mapNotificationData(response.data);
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  async markAsRead(id: number): Promise<Notification> {
    try {
      const response = await apiClient.patch(`/notifications/${id}/read`);
      return this.mapNotificationData(response.data);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await apiClient.patch(`/notifications/user/${userId}/mark-all-read`);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  async deleteNotification(id: number): Promise<void> {
    try {
      await apiClient.delete(`/notifications/${id}`);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get(`/notifications/unread-count`);
      return response.data.count || 0;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  }

  async getNotificationPreferences(
    userId: string
  ): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.get(
        `/notifications/preferences?userId=${userId}`
      );
      return response.data.preferences || {};
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      throw error;
    }
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.put("/notifications/preferences", {
        userId,
        ...preferences,
      });
      return response.data.preferences || {};
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      throw error;
    }
  }
}
