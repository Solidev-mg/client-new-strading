import apiClient from "@/services/api";
import {
  Conversation,
  ConversationFilter,
  ConversationResponse,
  ConversationStatus,
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
    // CRITICAL FIX: Always extract IDs from sender/receiver objects if available
    // This is the most reliable source
    let senderId: number;
    let receiverId: number;

    // Priority 1: Get from sender/receiver objects (most reliable)
    if (data.sender && typeof data.sender === 'object') {
      senderId = (data.sender as Record<string, unknown>).id as number;
    } else {
      // Priority 2: Get from direct properties
      senderId = (data.senderId || data.sender_id) as number;
    }

    if (data.receiver && typeof data.receiver === 'object') {
      receiverId = (data.receiver as Record<string, unknown>).id as number;
    } else {
      receiverId = (data.receiverId || data.receiver_id) as number;
    }

    const conversationId = (data.conversationId || data.conversation_id) as number | undefined;
    const isRead = (data.isRead !== undefined ? data.isRead : data.is_read) as boolean;
    
    return {
      id: data.id as number,
      senderId,
      receiverId,
      content: data.content as string,
      type: (data.type as MessageType) || MessageType.TEXT,
      isRead,
      conversationId,
      createdAt: new Date(data.createdAt as string || data.created_at as string),
      updatedAt: new Date(data.updatedAt as string || data.updated_at as string),
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
      name:
        `${data.firstname || ""} ${data.lastname || ""}`.trim() ||
        (data.name as string) ||
        (data.email as string),
      email: data.email as string,
      role: data.role as UserRole,
      firstname: data.firstname as string,
      lastname: data.lastname as string,
    };
  }

  private mapConversationData(data: Record<string, unknown>): Conversation {
    // Build user from various possible field patterns
    const otherUser: User = {
      id:
        (data.client_id as number) ||
        (data.assigned_admin_id as number) ||
        (data.clientId as number) ||
        (data.assignedAdminId as number) ||
        0,
      name:
        `${
          (data.client_firstname as string) ||
          (data.admin_firstname as string) ||
          ""
        } ${
          (data.client_lastname as string) ||
          (data.admin_lastname as string) ||
          ""
        }`.trim() ||
        (data.client_email as string) ||
        (data.admin_email as string) ||
        "Unknown",
      email:
        (data.client_email as string) || (data.admin_email as string) || "",
      role:
        (data.client_role as UserRole) ||
        (data.admin_role as UserRole) ||
        UserRole.CLIENT,
      firstname:
        (data.client_firstname as string) || (data.admin_firstname as string),
      lastname:
        (data.client_lastname as string) || (data.admin_lastname as string),
    };

    return {
      id:
        (data.conversation_id as number) ||
        (data.conversationId as number) ||
        (data.id as number),
      conversationId:
        (data.conversation_id as number) || (data.conversationId as number),
      clientId: (data.client_id as number) || (data.clientId as number),
      assignedAdminId:
        (data.assigned_admin_id as number) || (data.assignedAdminId as number),
      status:
        (data.status as string as ConversationStatus) ||
        ConversationStatus.OPEN,
      lastMessageAt: data.last_message_at
        ? new Date(data.last_message_at as string)
        : data.lastMessageAt
        ? new Date(data.lastMessageAt as string)
        : undefined,
      lastClientMessageAt: data.last_client_message_at
        ? new Date(data.last_client_message_at as string)
        : data.lastClientMessageAt
        ? new Date(data.lastClientMessageAt as string)
        : undefined,
      autoCloseWarningSent:
        (data.auto_close_warning_sent as boolean) ||
        (data.autoCloseWarningSent as boolean) ||
        false,
      createdAt: new Date(
        (data.created_at as string) || (data.createdAt as string)
      ),
      otherUser,
      lastMessage: data.lastMessage
        ? this.mapMessageData(data.lastMessage as Record<string, unknown>)
        : data.last_message_content
        ? ({
            id: data.last_message_id as number,
            content: data.last_message_content as string,
            senderId: data.last_message_sender_id as number,
            type: (data.last_message_type as MessageType) || MessageType.TEXT,
            createdAt: new Date(data.last_message_created_at as string),
          } as Message)
        : undefined,
      unreadCount:
        (data.unreadCount as number) || (data.unread_count as number) || 0,
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
    conversationIdOrUserId: number,
    filter?: MessageFilter
  ): Promise<MessageResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (filter?.page) queryParams.append("page", filter.page.toString());
      if (filter?.limit) queryParams.append("limit", filter.limit.toString());

      const response = await apiClient.get(
        `/messages/conversation/${conversationIdOrUserId}?${queryParams.toString()}`
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
      if (filter?.status) queryParams.append("status", filter.status);

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

      // If the API returns raw conversation data array
      const conversationsArray =
        rawData.data || rawData.items || rawData.conversations || rawData;

      const mappedConversations = Array.isArray(conversationsArray)
        ? conversationsArray.map((conversation) =>
            this.mapConversationData(conversation)
          )
        : [];

      return {
        conversations: mappedConversations,
        total: rawData.total || mappedConversations.length,
        page: rawData.page || filter?.page || 1,
        limit: rawData.limit || filter?.limit || 20,
        totalPages: rawData.totalPages || 1,
      };
    } catch (error) {
      console.error("Error fetching conversations:", error);
      throw error;
    }
  }

  async getArchivedConversations(
    filter?: ConversationFilter
  ): Promise<ConversationResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (filter?.page) queryParams.append("page", filter.page.toString());
      if (filter?.limit) queryParams.append("limit", filter.limit.toString());

      const response = await apiClient.get(
        `/messages/conversations/archived?${queryParams.toString()}`
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
        rawData.data || rawData.items || rawData.conversations || rawData;

      const mappedConversations = Array.isArray(conversationsArray)
        ? conversationsArray.map((conversation) =>
            this.mapConversationData(conversation)
          )
        : [];

      return {
        conversations: mappedConversations,
        total: rawData.total || mappedConversations.length,
        page: rawData.page || filter?.page || 1,
        limit: rawData.limit || filter?.limit || 20,
        totalPages: rawData.totalPages || 1,
      };
    } catch (error) {
      console.error("Error fetching archived conversations:", error);
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

  async assignConversation(conversationId: number): Promise<Conversation> {
    try {
      const response = await apiClient.post(
        `/messages/conversations/${conversationId}/assign`
      );
      return this.mapConversationData(response.data);
    } catch (error) {
      console.error("Error assigning conversation:", error);
      throw error;
    }
  }

  async closeConversation(conversationId: number): Promise<Conversation> {
    try {
      const response = await apiClient.post(
        `/messages/conversations/${conversationId}/close`
      );
      return this.mapConversationData(response.data);
    } catch (error) {
      console.error("Error closing conversation:", error);
      throw error;
    }
  }

  async archiveConversation(conversationId: number): Promise<Conversation> {
    try {
      const response = await apiClient.post(
        `/messages/conversations/${conversationId}/archive`
      );
      return this.mapConversationData(response.data);
    } catch (error) {
      console.error("Error archiving conversation:", error);
      throw error;
    }
  }
}
