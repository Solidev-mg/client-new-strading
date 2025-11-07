import apiClient from "@/services/api";
import {
  Conversation,
  ConversationFilter,
  ConversationResponse,
  Message,
  MessageFilter,
  MessageResponse,
  MessageType,
  SendMessageRequest,
  User,
  UserRole,
} from "../../domain/entities/message.entity";
import { MessageRepository } from "../../domain/repositories/message.repository";

export class ApiMessageRepository implements MessageRepository {
  private mapMessageData(data: Record<string, unknown>): Message {
    return {
      id: data.id as number,
      senderId: data.senderId as number,
      receiverId: data.receiverId as number,
      content: data.content as string,
      type: (data.type as MessageType) || MessageType.TEXT,
      isRead: data.isRead as boolean,
      createdAt: new Date(data.createdAt as string),
      updatedAt: new Date(data.updatedAt as string),
      sender: data.sender
        ? this.mapUserData(data.sender as Record<string, unknown>)
        : undefined,
      receiver: data.receiver
        ? this.mapUserData(data.receiver as Record<string, unknown>)
        : undefined,
    };
  }

  private mapUserData(data: Record<string, unknown>): User {
    return {
      id: data.id as number,
      name: data.name as string,
      email: data.email as string,
      role: data.role as UserRole,
    };
  }

  private mapConversationData(data: Record<string, unknown>): Conversation {
    return {
      id: data.id as string,
      otherUser: this.mapUserData(data.otherUser as Record<string, unknown>),
      lastMessage: this.mapMessageData(
        data.lastMessage as Record<string, unknown>
      ),
      unreadCount: data.unreadCount as number,
      updatedAt: new Date(data.updatedAt as string),
    };
  }

  async sendMessage(messageData: SendMessageRequest): Promise<Message[]> {
    try {
      const response = await apiClient.post("/messages", messageData);
      // The API returns an array of messages when client sends to all admins
      const messages = Array.isArray(response.data)
        ? response.data
        : [response.data];
      return messages.map((message: Record<string, unknown>) =>
        this.mapMessageData(message)
      );
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async getConversation(
    otherUserId: number,
    filter?: MessageFilter
  ): Promise<MessageResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (filter?.page) queryParams.append("page", filter.page.toString());
      if (filter?.limit) queryParams.append("limit", filter.limit.toString());

      const response = await apiClient.get(
        `/messages/conversation/${otherUserId}?${queryParams.toString()}`
      );

      const rawData = response.data as {
        data?: Record<string, unknown>[];
        items?: Record<string, unknown>[];
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
      };

      const messagesArray = rawData.data || rawData.items || [];
      const mappedMessages = messagesArray.map((message) =>
        this.mapMessageData(message)
      );

      return {
        messages: mappedMessages,
        total: rawData.total || 0,
        page: rawData.page || filter?.page || 1,
        limit: rawData.limit || filter?.limit || 20,
        totalPages: rawData.totalPages || 1,
      };
    } catch (error) {
      console.error("Error fetching conversation:", error);
      throw error;
    }
  }

  async getConversations(
    filter?: ConversationFilter
  ): Promise<ConversationResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (filter?.page) queryParams.append("page", filter.page.toString());
      if (filter?.limit) queryParams.append("limit", filter.limit.toString());

      const response = await apiClient.get(
        `/messages/conversations?${queryParams.toString()}`
      );

      const rawData = response.data as {
        data?: Record<string, unknown>[];
        items?: Record<string, unknown>[];
        conversations?: Record<string, unknown>[];
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
      };

      const conversationsArray =
        rawData.data || rawData.items || rawData.conversations || [];
      const mappedConversations = conversationsArray.map((conversation) =>
        this.mapConversationData(conversation)
      );

      return {
        conversations: mappedConversations,
        total: rawData.total || 0,
        page: rawData.page || filter?.page || 1,
        limit: rawData.limit || filter?.limit || 20,
        totalPages: rawData.totalPages || 1,
      };
    } catch (error) {
      console.error("Error fetching conversations:", error);
      throw error;
    }
  }

  async markAsRead(messageId: number): Promise<Message> {
    try {
      const response = await apiClient.post(`/messages/${messageId}/mark-read`);
      return this.mapMessageData(response.data);
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw error;
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get("/messages/unread-count");
      return response.data.count || 0;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  }
}
