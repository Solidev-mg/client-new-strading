"use client";

import { io, Socket } from "socket.io-client";
import { CookieService } from "./cookie.service";

export class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private connectionFailed = false; // Flag pour éviter les tentatives multiples

  private listeners: { [event: string]: ((data: any) => void)[] } = {};

  connect(): Promise<void> {
    return new Promise((resolve) => {
      // Si la connexion a déjà échoué, ne pas réessayer
      if (this.connectionFailed) {
        console.warn("WebSocket connection disabled due to previous failure");
        resolve();
        return;
      }

      if (this.socket?.connected) {
        resolve();
        return;
      }

      const tokenData = CookieService.getTokenData();
      if (!tokenData?.accessToken) {
        console.warn("No access token available for WebSocket");
        resolve();
        return;
      }

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010";

      // Timeout de 5 secondes pour résoudre la promesse même si pas de connexion
      const connectionTimeout = setTimeout(() => {
        console.warn(
          "WebSocket connection timeout - continuing without real-time updates"
        );
        resolve();
      }, 5000);

      this.socket = io(`${API_BASE_URL}/notifications`, {
        auth: {
          token: `Bearer ${tokenData.accessToken}`,
        },
        transports: ["websocket", "polling"],
        timeout: 5000,
        reconnection: true, // Activer la reconnexion automatique
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.socket.on("connect", () => {
        console.log("WebSocket connected");
        clearTimeout(connectionTimeout);
        this.reconnectAttempts = 0;
        this.connectionFailed = false;

        // S'abonner aux notifications utilisateur
        this.socket?.emit("subscribe", { userId: tokenData.accessToken });

        this.emit("connect", {});

        resolve();
      });

      this.socket.on("disconnect", (reason) => {
        console.log("WebSocket disconnected:", reason);
      });

      this.socket.on("connect_error", (error) => {
        console.warn("WebSocket connection error:", error.message || error);
        clearTimeout(connectionTimeout);

        // Ne pas marquer comme échoué définitivement, laisser la reconnexion automatique gérer
        // this.connectionFailed = true;
        // this.disconnect();

        // Résoudre quand même pour ne pas bloquer l'application
        resolve();
      });

      this.socket.on("notification", (data) => {
        console.log("Received notification:", data);
        this.emit("notification", data);
      });

      this.socket.on("unread_count_update", (data) => {
        console.log("Unread count update:", data);
        this.emit("unread_count_update", data);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback?: (data: any) => void) {
    if (!this.listeners[event]) return;

    if (callback) {
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback
      );
    } else {
      delete this.listeners[event];
    }
  }

  private emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }

  markAsRead(notificationId: string) {
    if (this.socket?.connected) {
      this.socket.emit("mark_as_read", { notificationId });
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Instance singleton
export const webSocketService = new WebSocketService();
