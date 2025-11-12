"use client";

import { useUser } from "@/contexts/UserContext";
import { webSocketMessagesService } from "@/services/websocket-messages.service";
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

    // Connect to WebSocket if not already connected
    if (!webSocketMessagesService.isConnected()) {
      webSocketMessagesService.connect(Number(user.id));
    }

    // Listen for WebSocket updates to refresh unread count in real-time
    const handleConversationUpdate = () => {
      refreshUnreadCount();
    };

    const handleNewMessage = () => {
      refreshUnreadCount();
    };

    webSocketMessagesService.onConversationUpdate(handleConversationUpdate);
    webSocketMessagesService.onNewMessage(handleNewMessage);

    // Rafraîchir le compteur toutes les 30 secondes as fallback
    const interval = setInterval(refreshUnreadCount, 30000);

    return () => {
      clearInterval(interval);
      // Don't disconnect or remove all listeners - the messages page needs them
    };
  }, [user?.clientUserId, user?.id, refreshUnreadCount]);

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
