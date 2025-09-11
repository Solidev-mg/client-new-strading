import {
  CreateNotificationRequest,
  Notification,
  NotificationFilter,
  NotificationPreferences,
} from "../../domain/entities/notification.entity";
import { NotificationRepository } from "../../domain/repositories/notification.repository";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiNotificationRepository implements NotificationRepository {
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

      const token = localStorage.getItem("token");
      const parsedToken = token ? JSON.parse(token) : null;

      const response = await fetch(
        `${BASE_URL}notifications?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${parsedToken?.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      return data.notifications || [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  async getNotificationById(id: string): Promise<Notification | null> {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = token ? JSON.parse(token) : null;

      const response = await fetch(`${BASE_URL}notifications/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedToken?.accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error("Failed to fetch notification");
      }

      const data = await response.json();
      return data.notification;
    } catch (error) {
      console.error("Error fetching notification:", error);
      throw error;
    }
  }

  async createNotification(
    notificationData: CreateNotificationRequest
  ): Promise<Notification> {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = token ? JSON.parse(token) : null;

      const response = await fetch(`${BASE_URL}notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedToken?.accessToken}`,
        },
        body: JSON.stringify(notificationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create notification");
      }

      const data = await response.json();
      return data.notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  async markAsRead(id: string): Promise<boolean> {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = token ? JSON.parse(token) : null;

      const response = await fetch(`${BASE_URL}notifications/${id}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedToken?.accessToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = token ? JSON.parse(token) : null;

      const response = await fetch(`${BASE_URL}notifications/mark-all-read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedToken?.accessToken}`,
        },
        body: JSON.stringify({ userId }),
      });

      return response.ok;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
  }

  async deleteNotification(id: string): Promise<boolean> {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = token ? JSON.parse(token) : null;

      const response = await fetch(`${BASE_URL}notifications/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedToken?.accessToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error("Error deleting notification:", error);
      return false;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = token ? JSON.parse(token) : null;

      const response = await fetch(
        `${BASE_URL}notifications/unread-count?userId=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${parsedToken?.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch unread count");
      }

      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  }

  async getNotificationPreferences(
    userId: string
  ): Promise<NotificationPreferences> {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = token ? JSON.parse(token) : null;

      const response = await fetch(
        `${BASE_URL}notifications/preferences?userId=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${parsedToken?.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notification preferences");
      }

      const data = await response.json();
      return data.preferences;
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
      const token = localStorage.getItem("token");
      const parsedToken = token ? JSON.parse(token) : null;

      const response = await fetch(`${BASE_URL}notifications/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedToken?.accessToken}`,
        },
        body: JSON.stringify({ userId, ...preferences }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update notification preferences"
        );
      }

      const data = await response.json();
      return data.preferences;
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      throw error;
    }
  }
}
