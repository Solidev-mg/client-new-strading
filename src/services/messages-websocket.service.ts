import { io, Socket } from "socket.io-client";

interface AuthenticatedSocket extends Socket {
  userId?: number;
}

interface WebSocketEventData {
  [key: string]: unknown;
}

class MessagesWebSocketService {
  private socket: AuthenticatedSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, ((data: unknown) => void)[]> = new Map();
  private currentUserId: number | null = null;

  constructor() {
    // Ne pas connecter automatiquement, attendre l'authentification explicite
  }

  connect(userId: number) {
    if (this.currentUserId === userId && this.socket?.connected) {
      return; // Déjà connecté avec le bon utilisateur
    }

    this.currentUserId = userId;
    this.disconnect(); // Déconnecter d'abord si nécessaire

    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010/api";
    // Extraire la base URL sans /api
    const baseUrl = API_BASE_URL.replace("/api", "");

    this.socket = io(`${baseUrl}/messages`, {
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
    });

    this.socket.on("connect", () => {
      console.log("🔗 Messages WebSocket connected");
      this.reconnectAttempts = 0;
      // S'authentifier immédiatement après la connexion
      this.authenticate(userId);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Messages WebSocket disconnected:", reason);
      if (reason === "io server disconnect") {
        this.attemptReconnect(userId);
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Messages WebSocket connection error:", error);
      this.attemptReconnect(userId);
    });

    // Écouter les événements de messages
    this.socket.on("authenticated", (data) => {
      console.log("✅ Messages WebSocket authenticated:", data);
      this.emit("authenticated", data);
    });

    this.socket.on("newMessage", (message) => {
      console.log("📨 New message received:", message);
      this.emit("newMessage", message);
    });

    this.socket.on("conversationUpdate", (data) => {
      console.log("💬 Conversation update:", data);
      this.emit("conversationUpdate", data);
    });

    this.socket.on("unreadCount", (data) => {
      console.log("📊 Unread count update:", data);
      this.emit("unreadCount", data);
    });

    this.socket.on("messageSent", (data) => {
      console.log("✅ Message sent confirmation:", data);
      this.emit("messageSent", data);
    });

    this.socket.on("messageError", (error) => {
      console.error("❌ Message error:", error);
      this.emit("messageError", error);
    });

    this.socket.on("messageMarkedAsRead", (data) => {
      console.log("✅ Message marked as read:", data);
      this.emit("messageMarkedAsRead", data);
    });
  }

  private authenticate(userId: number) {
    if (this.socket && this.socket.connected) {
      console.log("🔐 Authenticating user for messages:", userId);
      this.socket.emit("authenticate", { userId });
    }
  }

  private attemptReconnect(userId: number) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `🔄 Attempting to reconnect messages WS (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );

      setTimeout(() => {
        this.connect(userId);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error("❌ Max reconnection attempts reached for messages WS");
    }
  }

  // Envoyer un message
  sendMessage(messageData: WebSocketEventData) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("sendMessage", messageData);
    } else {
      console.warn("⚠️ Messages WebSocket not connected, cannot send message");
    }
  }

  // Marquer un message comme lu
  markAsRead(messageId: number, userId: number) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("markAsRead", { messageId, userId });
    } else {
      console.warn("⚠️ Messages WebSocket not connected, cannot mark as read");
    }
  }

  // Rejoindre une conversation
  joinConversation(userId: number, otherUserId: number) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("joinConversation", { userId, otherUserId });
    }
  }

  // Quitter une conversation
  leaveConversation(userId: number, otherUserId: number) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("leaveConversation", { userId, otherUserId });
    }
  }

  // Écouter un événement
  on(event: string, callback: (data: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  // Arrêter d'écouter un événement
  off(event: string, callback?: (data: unknown) => void) {
    if (callback) {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(callback);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
    } else {
      this.listeners.delete(event);
    }
  }

  // Émettre un événement aux listeners locaux
  private emit(event: string, data: WebSocketEventData) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  }

  // Déconnecter
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
    this.currentUserId = null;
  }

  // Vérifier si connecté
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Obtenir l'user ID actuel
  getCurrentUserId(): number | null {
    return this.currentUserId;
  }
}

// Singleton
export const messagesWebSocketService = new MessagesWebSocketService();
