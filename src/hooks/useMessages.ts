import { messageRepository } from "@/app/modules/message";
import {
  Conversation,
  Message,
  SendMessageRequest,
} from "@/app/modules/message/domain/entities/message.entity";
import { useCallback, useEffect, useState } from "react";

export const useMessages = (autoLoad: boolean = true) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const loadConversations = useCallback(
    async (page: number = 1, limit: number = 20) => {
      try {
        setLoading(true);
        setError(null);
        const response = await messageRepository.getConversations({
          page,
          limit,
        });
        setConversations(response.conversations);
        setPagination({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        });
      } catch (err) {
        setError("Erreur lors du chargement des conversations");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await messageRepository.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error(
        "Erreur lors du chargement du compteur de messages non lus:",
        err
      );
    }
  }, []);

  const sendMessage = useCallback(
    async (messageData: SendMessageRequest) => {
      try {
        const newMessages = await messageRepository.sendMessage(messageData);
        // Refresh conversations after sending
        await loadConversations();
        await loadUnreadCount();
        return newMessages;
      } catch (err) {
        console.error("Erreur lors de l'envoi du message:", err);
        throw err;
      }
    },
    [loadConversations, loadUnreadCount]
  );

  useEffect(() => {
    if (autoLoad) {
      loadConversations();
      loadUnreadCount();
    }
  }, [autoLoad, loadConversations, loadUnreadCount]);

  return {
    conversations,
    loading,
    error,
    unreadCount,
    pagination,
    loadConversations,
    loadUnreadCount,
    sendMessage,
    refresh: () => {
      loadConversations(pagination.page, pagination.limit);
      loadUnreadCount();
    },
  };
};

export const useConversation = (
  otherUserId?: number,
  autoLoad: boolean = true
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const loadConversation = useCallback(
    async (page: number = 1, limit: number = 20) => {
      if (!otherUserId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await messageRepository.getConversation(otherUserId, {
          page,
          limit,
        });
        setMessages(response.messages);
        setPagination({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        });
      } catch (err) {
        setError("Erreur lors du chargement de la conversation");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [otherUserId]
  );

  const sendMessage = useCallback(async (messageData: SendMessageRequest) => {
    try {
      const newMessages = await messageRepository.sendMessage(messageData);
      // Add new messages to current conversation
      setMessages((prev) => [...prev, ...newMessages]);
      return newMessages;
    } catch (err) {
      console.error("Erreur lors de l'envoi du message:", err);
      throw err;
    }
  }, []);

  const markAsRead = useCallback(async (messageId: number) => {
    try {
      const updatedMessage = await messageRepository.markAsRead(messageId);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? updatedMessage : msg))
      );
    } catch (err) {
      console.error("Erreur lors du marquage du message comme lu:", err);
    }
  }, []);

  useEffect(() => {
    if (autoLoad && otherUserId) {
      loadConversation();
    }
  }, [autoLoad, otherUserId, loadConversation]);

  return {
    messages,
    loading,
    error,
    pagination,
    loadConversation,
    sendMessage,
    markAsRead,
    refresh: () => loadConversation(pagination.page, pagination.limit),
  };
};
