export interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  eventType: string;
  priority: string;
  status: string;
  channels: string[];
  packageId?: string | null;
  trackingCode?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  scheduledAt?: Date | null;
  sentAt?: Date | null;
  readAt?: Date | null;
  // Propriétés calculées
  isRead: boolean;
}

export enum NotificationType {
  PACKAGE_RECEIVED = "PACKAGE_RECEIVED",
  PACKAGE_DEPARTED = "PACKAGE_DEPARTED",
  PACKAGE_ARRIVED = "PACKAGE_ARRIVED",
  PACKAGE_RETRIEVED = "PACKAGE_RETRIEVED",
  SHIPPING_MODE_CHANGED = "SHIPPING_MODE_CHANGED",
  NEW_INVOICE = "NEW_INVOICE",
  PAYMENT_RECEIVED = "PAYMENT_RECEIVED",
  TRANSFER_COMPLETED = "TRANSFER_COMPLETED",
  TRANSFER_FAILED = "TRANSFER_FAILED",
  SYSTEM_ANNOUNCEMENT = "SYSTEM_ANNOUNCEMENT",
}

export enum NotificationEntityType {
  PACKAGE = "PACKAGE",
  INVOICE = "INVOICE",
  TRANSFER = "TRANSFER",
  USER = "USER",
}

export interface NotificationFilter {
  isRead?: boolean;
  type?: NotificationType;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface NotificationPaginatedResponse {
  items: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateNotificationRequest {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedEntityId?: string;
  relatedEntityType?: NotificationEntityType;
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  notificationTypes: NotificationType[];
}
