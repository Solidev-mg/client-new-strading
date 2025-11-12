"use client";

import { Message } from "@/app/modules/message/domain/entities/message.entity";
import { io, Socket } from "socket.io-client";
import { CookieService } from "./cookie.service";

type MessageCallback = (message: Message) => void;
type ConversationUpdateCallback = () => void;
type UnreadCountCallback = (count: number) => void;

class WebSocketMessagesService {
  private socket: Socket | null = null;
  private userId: number | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  /**
   * Se connecter au namespace /messages du serveur WebSocket
   * @param userId - Optional: Pass user ID directly instead of reading from cookie
   */
  connect(userId?: number): void {
    // Try to get user ID from parameter or cookie
    let effectiveUserId: number | null = null;

    if (userId) {
      console.log("🔌 Using provided userId:", userId);
      effectiveUserId = userId;
    } else {
      // Get user data from cookies
      const userData = CookieService.getUserData();

      console.log("🔌 Attempting WebSocket connection:");
      console.log("  - Raw userData from cookie:", userData);
      console.log("  - userData type:", typeof userData);

      if (!userData || !userData.id) {
        console.error("❌ No user data available for WebSocket connection");
        console.error("  - userData:", userData);
        console.error("  - userData.id:", userData?.id);
        return;
      }

      effectiveUserId = Number(userData.id);
    }

    this.userId = effectiveUserId;

    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010";
    // Remove /api and any trailing slashes for WebSocket connection
    const wsUrl = API_BASE_URL.replace(/\/api\/?$/, "");

    console.log("🔌 Connecting to WebSocket for messages:");
    console.log("  - API_BASE_URL:", API_BASE_URL);
    console.log("  - WebSocket URL:", `${wsUrl}/messages`);
    console.log("  - User ID:", this.userId);
    console.log("  - User ID type:", typeof this.userId);

    this.socket = io(`${wsUrl}/messages`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
  }

  /**
   * Configuration des écouteurs d'événements
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ WebSocket Messages connected");
      console.log("  - Socket ID:", this.socket?.id);
      this.reconnectAttempts = 0;

      // Use setTimeout to ensure socket.connected is true
      if (this.userId) {
        setTimeout(() => {
          this.authenticate(this.userId!);
        }, 100);
      }
    });

    this.socket.on("disconnect", (reason: string) => {
      console.log("❌ WebSocket Messages disconnected:", reason);
    });

    this.socket.on("connect_error", (error: Error) => {
      console.error("🔴 WebSocket Messages connection error:", error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("❌ Max reconnection attempts reached");
      }
    });

    this.socket.on("reconnect", (attemptNumber: number) => {
      console.log(
        `🔄 WebSocket Messages reconnected after ${attemptNumber} attempts`
      );
      this.reconnectAttempts = 0;
      
      // Re-authenticate after reconnection
      if (this.userId) {
        setTimeout(() => {
          this.authenticate(this.userId!);
        }, 100);
      }
    });
  }

  /**
   * S'authentifier auprès du serveur
   */
  private authenticate(userId: number): void {
    if (this.socket && this.socket.connected) {
      console.log(`🔐 Authenticating user ${userId} on messages namespace`);
      console.log(`  - Socket ID: ${this.socket.id}`);

      this.socket.emit("authenticate", { userId });

      console.log(`✅ Authentication event emitted for user ${userId}`);

      // Listen for authentication confirmation (if backend sends one)
      this.socket.once("authenticated", () => {
        console.log(`✅ Authentication confirmed by server for user ${userId}`);
      });
    } else {
      console.warn(`⚠️ Socket not yet connected, retrying authentication...`);
      // Retry after a short delay
      setTimeout(() => {
        if (this.socket && this.socket.connected) {
          this.authenticate(userId);
        }
      }, 200);
    }
  }

  /**
   * Se déconnecter
   */
  disconnect(): void {
    if (this.socket) {
      console.log("🔌 Disconnecting WebSocket Messages");
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  /**
   * Vérifier si connecté
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Écouter les nouveaux messages
   */
  onNewMessage(callback: MessageCallback): void {
    if (this.socket) {
      // Remove existing listener first to avoid duplicates
      this.socket.off("newMessage");
      
      this.socket.on("newMessage", (data: Record<string, unknown>) => {
        console.log("📨 RAW WebSocket data received:", {
          data,
          sender: data.sender,
          receiver: data.receiver,
          senderId_direct: data.senderId,
          receiverId_direct: data.receiverId,
        });

        // CRITICAL FIX: Always extract IDs from sender/receiver objects if available
        let senderId: number;
        let receiverId: number;

        // Priority 1: Get from sender/receiver objects (most reliable)
        if (data.sender && typeof data.sender === "object") {
          senderId = (data.sender as Record<string, unknown>).id as number;
        } else {
          // Priority 2: Get from direct properties
          senderId = (data.senderId || data.sender_id) as number;
        }

        if (data.receiver && typeof data.receiver === "object") {
          receiverId = (data.receiver as Record<string, unknown>).id as number;
        } else {
          receiverId = (data.receiverId || data.receiver_id) as number;
        }

        const message: Message = {
          ...data,
          senderId,
          receiverId,
          conversationId: (data.conversationId || data.conversation_id) as
            | number
            | undefined,
          isRead: (data.isRead !== undefined
            ? data.isRead
            : data.is_read) as boolean,
          createdAt: new Date((data.createdAt || data.created_at) as string),
          updatedAt: new Date((data.updatedAt || data.updated_at) as string),
        } as Message;

        console.log("📨 Parsed WebSocket message:", {
          id: message.id,
          senderId: message.senderId,
          receiverId: message.receiverId,
          content: message.content.substring(0, 30),
          hasReceiverObject: !!message.receiver,
          hasSenderObject: !!message.sender,
        });

        callback(message);
      });
    }
  }

  /**
   * Écouter les mises à jour de conversation
   */
  onConversationUpdate(callback: ConversationUpdateCallback): void {
    if (this.socket) {
      // Remove existing listener first to avoid duplicates
      this.socket.off("conversationUpdate");
      
      this.socket.on("conversationUpdate", () => {
        console.log("🔄 Conversation updated via WebSocket");
        callback();
      });
    }
  }

  /**
   * Écouter le compteur de messages non lus
   */
  onUnreadCount(callback: UnreadCountCallback): void {
    if (this.socket) {
      // Remove existing listener first to avoid duplicates
      this.socket.off("unreadCount");
      
      this.socket.on("unreadCount", (data: { count: number }) => {
        console.log("📬 Unread count update:", data.count);
        callback(data.count);
      });
    }
  }

  /**
   * Envoyer un message via WebSocket
   */
  sendMessage(data: {
    senderId: number;
    content: string;
    type?: string;
    receiverId?: number;
  }): void {
    if (this.socket && this.socket.connected) {
      console.log("📤 Sending message via WebSocket");
      this.socket.emit("sendMessage", {
        ...data,
        type: data.type || "text",
      });
    } else {
      console.warn("⚠️ Cannot send message: WebSocket not connected");
    }
  }

  /**
   * Nettoyer tous les écouteurs
   */
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.off("newMessage");
      this.socket.off("conversationUpdate");
      this.socket.off("unreadCount");
    }
  }
}

// Instance singleton
export const webSocketMessagesService = new WebSocketMessagesService();
