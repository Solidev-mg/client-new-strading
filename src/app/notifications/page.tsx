"use client";

import { Notification } from "@/app/modules/notification/domain/entities/notification.entity";
import { useUser } from "@/contexts/UserContext";
import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { notificationRepository } from "../modules/notification";

export default function NotificationsPage() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [unreadCount, setUnreadCount] = useState(0);
  const [deleting, setDeleting] = useState<number | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!user?.clientUserId) return;

    try {
      setLoading(true);
      const filterObj =
        filter === "UNREAD"
          ? { isRead: false }
          : filter === "READ"
          ? { isRead: true }
          : undefined;
      const data = await notificationRepository.getNotifications(filterObj);
      setNotifications(data);

      // Charger toutes les notifications pour les compteurs
      if (filter !== "ALL") {
        const allData = await notificationRepository.getNotifications();
        setAllNotifications(allData);
      } else {
        setAllNotifications(data);
      }

      const count = await notificationRepository.getUnreadCount(
        user.clientUserId.toString()
      );
      setUnreadCount(count);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [filter, user?.clientUserId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = async (notificationId: number) => {
    try {
      const updatedNotification = await notificationRepository.markAsRead(
        notificationId
      );
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? updatedNotification
            : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erreur lors du marquage comme lu:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.clientUserId) return;

    try {
      await notificationRepository.markAllAsRead(user.clientUserId.toString());
      await loadNotifications(); // Recharger les notifications
    } catch (error) {
      console.error(
        "Erreur lors du marquage de toutes les notifications comme lues:",
        error
      );
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      setDeleting(notificationId);
      await notificationRepository.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setAllNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    } finally {
      setDeleting(null);
    }
  };

  const deleteAllRead = async () => {
    try {
      const readNotifications = allNotifications.filter((n) => n.isRead);
      for (const notification of readNotifications) {
        await notificationRepository.deleteNotification(notification.id);
      }
      await loadNotifications(); // Recharger les notifications
    } catch (error) {
      console.error(
        "Erreur lors de la suppression des notifications lues:",
        error
      );
    }
  };

  const getNotificationIcon = (eventType: string) => {
    switch (eventType) {
      case "PACKAGE_RECEIVED":
        return "📦";
      case "PACKAGE_DEPARTED":
        return "🚚";
      case "PACKAGE_ARRIVED":
        return "✈️";
      case "PACKAGE_RETRIEVED":
        return "✅";
      case "NEW_INVOICE":
        return "💰";
      case "TRANSFER_COMPLETED":
        return "💸";
      case "TRANSFER_FAILED":
        return "❌";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (eventType: string) => {
    switch (eventType) {
      case "PACKAGE_RECEIVED":
        return "border-l-blue-500";
      case "PACKAGE_DEPARTED":
        return "border-l-yellow-500";
      case "PACKAGE_ARRIVED":
        return "border-l-green-500";
      case "PACKAGE_RETRIEVED":
        return "border-l-gray-500";
      case "NEW_INVOICE":
        return "border-l-purple-500";
      case "TRANSFER_COMPLETED":
        return "border-l-green-500";
      case "TRANSFER_FAILED":
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
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Tout marquer comme lu
              </button>
            )}
            {allNotifications.some((n: Notification) => n.isRead) && (
              <button
                onClick={deleteAllRead}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Supprimer toutes les lues
              </button>
            )}
          </div>
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
            Toutes ({allNotifications.length})
          </button>
          <button
            onClick={() => setFilter("UNREAD")}
            className={`px-4 py-2 rounded-md ${
              filter === "UNREAD"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Non lues (
            {allNotifications.filter((n: Notification) => !n.isRead).length})
          </button>
          <button
            onClick={() => setFilter("READ")}
            className={`px-4 py-2 rounded-md ${
              filter === "READ"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Lues (
            {allNotifications.filter((n: Notification) => n.isRead).length})
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
                  notification.eventType
                )} ${
                  !notification.isRead ? "bg-blue-50" : "bg-white"
                } hover:bg-gray-50 transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="text-2xl">
                      {getNotificationIcon(notification.eventType)}
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
                    {!notification.isRead ? (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Marquer comme lu
                      </button>
                    ) : (
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        disabled={deleting === notification.id}
                        className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                      >
                        {deleting === notification.id
                          ? "Suppression..."
                          : "Supprimer"}
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
