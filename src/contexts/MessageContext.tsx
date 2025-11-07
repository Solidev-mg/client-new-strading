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
import { messageRepository } from "../app/modules/message";

interface MessageContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  decrementUnreadCount: () => void;
  resetUnreadCount: () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessagesContext = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessagesContext must be used within a MessageProvider");
  }
  return context;
};

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!user?.clientUserId) {
      setUnreadCount(0);
      return;
    }

    try {
      const count = await messageRepository.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du nombre de messages non lus:",
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
    if (!user?.clientUserId) return;

    refreshUnreadCount();

    // Rafraîchir le compteur toutes les 30 secondes
    const interval = setInterval(refreshUnreadCount, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [user?.clientUserId, refreshUnreadCount]);

  const value = {
    unreadCount,
    refreshUnreadCount,
    decrementUnreadCount,
    resetUnreadCount,
  };

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  );
};
