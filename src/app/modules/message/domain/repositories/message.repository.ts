import {
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

  // Get conversation with a specific user
  getConversation(
    otherUserId: number,
    filter?: MessageFilter
  ): Promise<MessageResponse>;

  // Get list of active conversations
  getConversations(filter?: ConversationFilter): Promise<ConversationResponse>;

  // Mark message as read
  markAsRead(messageId: number): Promise<Message>;

  // Get unread messages count
  getUnreadCount(): Promise<number>;
}
