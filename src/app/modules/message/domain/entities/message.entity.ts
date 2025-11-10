export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  type: MessageType;
  isRead: boolean;
  conversationId?: number;
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
  firstname?: string;
  lastname?: string;
}

export interface Conversation {
  id: number; // Real conversation ID from backend
  conversationId?: number;
  clientId: number;
  assignedAdminId?: number;
  status: ConversationStatus;
  lastMessageAt?: Date;
  lastClientMessageAt?: Date;
  autoCloseWarningSent?: boolean;
  createdAt: Date;
  otherUser?: User; // Client info for admins, Admin info for clients (made optional)
  lastMessage?: Message;
  unreadCount: number;
  // Legacy fields for compatibility
  client_firstname?: string;
  client_lastname?: string;
  client_email?: string;
  admin_firstname?: string;
  admin_lastname?: string;
  admin_email?: string;
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

export enum ConversationStatus {
  OPEN = "open",
  CLOSED = "closed",
  ARCHIVED = "archived",
}

export interface SendMessageRequest {
  content: string;
  type: MessageType;
  receiverId?: number; // Optional for client sending to admins
}

export interface ConversationFilter {
  page?: number;
  limit?: number;
  status?: ConversationStatus;
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
