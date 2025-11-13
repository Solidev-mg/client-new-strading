import { messageRepository } from "@/app/modules/message";
import {
  Conversation,
  Message,
  SendMessageRequest,
} from "@/app/modules/message/domain/entities/message.entity";
import { messagesWebSocketService } from "@/services/messages-websocket.service";
import { useCallback, useEffect, useState } from "react";

export const useMessages = (autoLoad: boolean = true) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [archivedConversations, setArchivedConversations] = useState<
    Conversation[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [archivedPagination, setArchivedPagination] = useState({
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

  const loadArchivedConversations = useCallback(
    async (page: number = 1, limit: number = 20) => {
      try {
        setLoading(true);
        setError(null);
        const response = await messageRepository.getArchivedConversations({
          page,
          limit,
        });
        setArchivedConversations(response.conversations);
        setArchivedPagination({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        });
      } catch (err) {
        setError("Erreur lors du chargement des conversations archivées");
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

  const assignConversation = useCallback(
    async (conversationId: number) => {
      try {
        const updatedConversation = await messageRepository.assignConversation(
          conversationId
        );
        // Refresh conversations after assignment
        await loadConversations();
        return updatedConversation;
      } catch (err) {
        console.error("Erreur lors de l'assignation de la conversation:", err);
        throw err;
      }
    },
    [loadConversations]
  );

  const closeConversation = useCallback(
    async (conversationId: number) => {
      try {
        const closedConversation = await messageRepository.closeConversation(
          conversationId
        );
        // Refresh conversations after closing
        await loadConversations();
        return closedConversation;
      } catch (err) {
        console.error("Erreur lors de la clôture de la conversation:", err);
        throw err;
      }
    },
    [loadConversations]
  );

  const archiveConversation = useCallback(
    async (conversationId: number) => {
      try {
        const archivedConversation =
          await messageRepository.archiveConversation(conversationId);
        // Refresh conversations after archiving
        await loadConversations();
        await loadArchivedConversations();
        return archivedConversation;
      } catch (err) {
        console.error("Erreur lors de l'archivage de la conversation:", err);
        throw err;
      }
    },
    [loadConversations, loadArchivedConversations]
  );

  // Gestionnaire pour les nouveaux messages
  const handleNewMessage = useCallback(
    (data: unknown) => {
      console.log("🎯 New message event received in useMessages:", data);
      // Recharger les conversations pour afficher le nouveau message
      loadConversations(pagination.page, pagination.limit);
    },
    [loadConversations, pagination.page, pagination.limit]
  );

  // Gestionnaire pour les mises à jour de conversation
  const handleConversationUpdate = useCallback(
    (data: unknown) => {
      console.log("💬 Conversation update event received:", data);
      // Recharger les conversations
      loadConversations(pagination.page, pagination.limit);
    },
    [loadConversations, pagination.page, pagination.limit]
  );

  useEffect(() => {
    if (autoLoad) {
      loadConversations();
      loadUnreadCount();
    }
  }, [autoLoad, loadConversations, loadUnreadCount]);

  // Écouter les événements WebSocket
  useEffect(() => {
    messagesWebSocketService.on("newMessage", handleNewMessage);
    messagesWebSocketService.on("conversationUpdate", handleConversationUpdate);

    return () => {
      messagesWebSocketService.off("newMessage", handleNewMessage);
      messagesWebSocketService.off(
        "conversationUpdate",
        handleConversationUpdate
      );
    };
  }, [handleNewMessage, handleConversationUpdate]);

  return {
    conversations,
    archivedConversations,
    loading,
    error,
    unreadCount,
    pagination,
    archivedPagination,
    loadConversations,
    loadArchivedConversations,
    loadUnreadCount,
    sendMessage,
    assignConversation,
    closeConversation,
    archiveConversation,
    refresh: () => {
      loadConversations(pagination.page, pagination.limit);
      loadUnreadCount();
    },
  };
};

export const useConversation = (
  conversationIdOrUserId?: number,
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
      if (!conversationIdOrUserId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await messageRepository.getConversation(
          conversationIdOrUserId,
          {
            page,
            limit,
          }
        );
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
    [conversationIdOrUserId]
  );

  const sendMessage = useCallback(async (messageData: SendMessageRequest) => {
    try {
      const newMessages = await messageRepository.sendMessage(messageData);
      // Don't add messages locally - let WebSocket handle it to avoid duplicates
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

  // Gestionnaire pour les nouveaux messages dans cette conversation
  const handleNewMessage = useCallback(
    (data: unknown) => {
      const message = data as Message;
      // Vérifier si le message appartient à cette conversation
      if (
        message.conversationId === conversationIdOrUserId ||
        message.senderId === conversationIdOrUserId ||
        message.receiverId === conversationIdOrUserId
      ) {
        console.log("📨 New message for current conversation:", message);
        setMessages((prev) => {
          // Éviter les doublons
          const exists = prev.some((m) => m.id === message.id);
          if (!exists) {
            return [...prev, message];
          }
          return prev;
        });
      }
    },
    [conversationIdOrUserId]
  );

  useEffect(() => {
    if (autoLoad && conversationIdOrUserId) {
      loadConversation();
    }
  }, [autoLoad, conversationIdOrUserId, loadConversation]);

  // Écouter les nouveaux messages
  useEffect(() => {
    messagesWebSocketService.on("newMessage", handleNewMessage);

    return () => {
      messagesWebSocketService.off("newMessage", handleNewMessage);
    };
  }, [handleNewMessage]);

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
