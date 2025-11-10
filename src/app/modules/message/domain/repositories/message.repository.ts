import {
  Conversation,
  ConversationFilter,
  ConversationResponse,
  Message,
  MessageFilter,
  MessageResponse,
  SendMessageRequest,
} from "../entities/message.entity";

export interface MessageRepository {
  // Send a message (client to all admins or admin to specific client)
  sendMessage(messageData: SendMessageRequest): Promise<Message[]>;

  // Get conversation with a specific user or conversation ID
  getConversation(
    conversationIdOrUserId: number,
    filter?: MessageFilter
  ): Promise<MessageResponse>;

  // Get list of active conversations
  getConversations(filter?: ConversationFilter): Promise<ConversationResponse>;

  // Get archived conversations
  getArchivedConversations(
    filter?: ConversationFilter
  ): Promise<ConversationResponse>;

  // Mark message as read
  markAsRead(messageId: number): Promise<Message>;

  // Get unread messages count
  getUnreadCount(): Promise<number>;

  // Assign conversation to current admin user
  assignConversation(conversationId: number): Promise<Conversation>;

  // Close a conversation (admin only)
  closeConversation(conversationId: number): Promise<Conversation>;

  // Archive a conversation
  archiveConversation(conversationId: number): Promise<Conversation>;
}
