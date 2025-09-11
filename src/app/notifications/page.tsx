"use client";

import {
  Notification,
  NotificationType,
} from "@/app/modules/notification/domain/entities/notification.entity";
import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock data pour démonstration
  const mockNotifications: Notification[] = useMemo(
    () => [
      {
        id: "1",
        userId: "user1",
        title: "Colis reçu en Chine",
        message:
          "Votre colis avec le numéro de tracking TR123456789 a été reçu dans notre entrepôt en Chine.",
        type: NotificationType.PACKAGE_RECEIVED,
        relatedEntityId: "package1",
        isRead: false,
        createdAt: new Date("2024-03-15T10:30:00"),
      },
      {
        id: "2",
        userId: "user1",
        title: "Nouvelle facture générée",
        message:
          "Une nouvelle facture a été générée pour le conteneur CONT-2024-001.",
        type: NotificationType.NEW_INVOICE,
        relatedEntityId: "invoice1",
        isRead: false,
        createdAt: new Date("2024-03-14T15:45:00"),
      },
      {
        id: "3",
        userId: "user1",
        title: "Colis en transit",
        message:
          "Votre colis TR123456789 est maintenant en transit vers Madagascar.",
        type: NotificationType.PACKAGE_DEPARTED,
        relatedEntityId: "package1",
        isRead: true,
        createdAt: new Date("2024-03-13T08:20:00"),
        readAt: new Date("2024-03-13T09:00:00"),
      },
      {
        id: "4",
        userId: "user1",
        title: "Transfert complété",
        message:
          "Votre transfert de 500 USD vers RMB a été complété avec succès.",
        type: NotificationType.TRANSFER_COMPLETED,
        relatedEntityId: "transfer1",
        isRead: true,
        createdAt: new Date("2024-03-12T14:10:00"),
        readAt: new Date("2024-03-12T16:30:00"),
      },
    ],
    []
  );

  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case "UNREAD":
        return mockNotifications.filter((n) => !n.isRead);
      case "READ":
        return mockNotifications.filter((n) => n.isRead);
      default:
        return mockNotifications;
    }
  }, [mockNotifications, filter]);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      // Simuler un appel API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setNotifications(filteredNotifications);
      setUnreadCount(mockNotifications.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [filteredNotifications, mockNotifications]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      // Simuler un appel API
      const updatedNotifications = notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true, readAt: new Date() }
          : notification
      );
      setNotifications(updatedNotifications);
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erreur lors du marquage comme lu:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Simuler un appel API
      const updatedNotifications = notifications.map((notification) => ({
        ...notification,
        isRead: true,
        readAt: notification.readAt || new Date(),
      }));
      setNotifications(updatedNotifications);
      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Erreur lors du marquage de toutes les notifications comme lues:",
        error
      );
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.PACKAGE_RECEIVED:
        return "📦";
      case NotificationType.PACKAGE_DEPARTED:
        return "🚚";
      case NotificationType.PACKAGE_ARRIVED:
        return "✈️";
      case NotificationType.PACKAGE_RETRIEVED:
        return "✅";
      case NotificationType.NEW_INVOICE:
        return "💰";
      case NotificationType.TRANSFER_COMPLETED:
        return "💸";
      case NotificationType.TRANSFER_FAILED:
        return "❌";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.PACKAGE_RECEIVED:
        return "border-l-blue-500";
      case NotificationType.PACKAGE_DEPARTED:
        return "border-l-yellow-500";
      case NotificationType.PACKAGE_ARRIVED:
        return "border-l-green-500";
      case NotificationType.PACKAGE_RETRIEVED:
        return "border-l-gray-500";
      case NotificationType.NEW_INVOICE:
        return "border-l-purple-500";
      case NotificationType.TRANSFER_COMPLETED:
        return "border-l-green-500";
      case NotificationType.TRANSFER_FAILED:
        return "border-l-red-500";
      default:
        return "border-l-gray-300";
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
    }
  };

  return (
    <DashboardLayout
      title="Notifications"
      description="Restez informé de tous les événements"
    >
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm mr-2">
                {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded-md ${
              filter === "ALL"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Toutes ({mockNotifications.length})
          </button>
          <button
            onClick={() => setFilter("UNREAD")}
            className={`px-4 py-2 rounded-md ${
              filter === "UNREAD"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Non lues ({mockNotifications.filter((n) => !n.isRead).length})
          </button>
          <button
            onClick={() => setFilter("READ")}
            className={`px-4 py-2 rounded-md ${
              filter === "READ"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Lues ({mockNotifications.filter((n) => n.isRead).length})
          </button>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">
              Chargement des notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <p className="text-gray-500">Aucune notification trouvée</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-l-4 ${getNotificationColor(
                  notification.type
                )} ${
                  !notification.isRead ? "bg-blue-50" : "bg-white"
                } hover:bg-gray-50 transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3
                          className={`text-sm font-medium ${
                            !notification.isRead
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Marquer comme lu
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
