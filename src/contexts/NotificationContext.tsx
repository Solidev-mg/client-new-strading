"use client";

import { useUser } from "@/contexts/UserContext";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { notificationRepository } from "../app/modules/notification";

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  decrementUnreadCount: () => void;
  resetUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!user?.clientUserId) {
      setUnreadCount(0);
      return;
    }

    try {
      const count = await notificationRepository.getUnreadCount(
        user.clientUserId.toString()
      );
      setUnreadCount(count);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du nombre de notifications:",
        error
      );
    }
  }, [user?.clientUserId]);

  const decrementUnreadCount = useCallback(() => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const resetUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    refreshUnreadCount();

    // Rafraîchir le compteur toutes les 60 secondes
    const interval = setInterval(refreshUnreadCount, 60000);

    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  const value = {
    unreadCount,
    refreshUnreadCount,
    decrementUnreadCount,
    resetUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
