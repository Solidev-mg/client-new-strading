export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  type: MessageType;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  sender?: User;
  receiver?: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Conversation {
  id: string; // Could be `${senderId}-${receiverId}` or similar
  otherUser: User;
  lastMessage: Message;
  unreadCount: number;
  updatedAt: Date;
}

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file",
}

export enum UserRole {
  CLIENT = "CLIENT",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export interface SendMessageRequest {
  content: string;
  type: MessageType;
  receiverId?: number; // Optional for client sending to all admins
}

export interface ConversationFilter {
  page?: number;
  limit?: number;
}

export interface ConversationResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MessageFilter {
  page?: number;
  limit?: number;
}

export interface MessageResponse {
  messages: Message[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
