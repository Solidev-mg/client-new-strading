"use client";

import { io, Socket } from "socket.io-client";
import { CookieService } from "./cookie.service";

export class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  private listeners: { [event: string]: ((data: any) => void)[] } = {};

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      const tokenData = CookieService.getTokenData();
      if (!tokenData?.accessToken) {
        reject(new Error("No access token available"));
        return;
      }

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010";

      this.socket = io(`${API_BASE_URL}/notifications`, {
        auth: {
          token: `Bearer ${tokenData.accessToken}`,
        },
        transports: ["websocket", "polling"],
        timeout: 20000,
      });

      this.socket.on("connect", () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;

        // S'abonner aux notifications utilisateur
        this.socket?.emit("subscribe", { userId: tokenData.accessToken });

        resolve();
      });

      this.socket.on("disconnect", (reason) => {
        console.log("WebSocket disconnected:", reason);
        this.handleReconnect();
      });

      this.socket.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error);
        this.handleReconnect();
        reject(error);
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

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );

      setTimeout(() => {
        this.connect().catch((error) => {
          console.error("Reconnection failed:", error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error("Max reconnection attempts reached");
    }
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
