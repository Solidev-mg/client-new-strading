export interface Transfer {
  id: string;
  userId: string;
  fromCurrency: Currency;
  toCurrency: Currency;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  fees: number;
  totalAmount: number;
  paymentMethod: TransferPaymentMethod;
  recipientInfo: RecipientInfo;
  status: TransferStatus;
  paymentProof?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  chatMessages: ChatMessage[];
}

export enum Currency {
  MGA = "MGA", // Ariary
  RMB = "RMB", // Yuan chinois
  USD = "USD", // Dollar américain
}

export enum TransferStatus {
  PENDING = "PENDING",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum TransferPaymentMethod {
  MOBILE_MONEY = "MOBILE_MONEY",
  ALIPAY = "ALIPAY",
  WECHAT = "WECHAT",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export interface RecipientInfo {
  type: "QR_CODE" | "BANK_ACCOUNT";
  qrCode?: string;
  bankDetails?: BankDetails;
}

export interface BankDetails {
  accountNumber: string;
  accountName: string;
  bankName: string;
  swiftCode?: string;
  iban?: string;
}

export interface ChatMessage {
  id: string;
  transferId: string;
  senderId: string;
  senderType: "USER" | "ADMIN";
  message: string;
  messageType: ChatMessageType;
  attachments?: ChatAttachment[];
  createdAt: Date;
}

export enum ChatMessageType {
  TEXT = "TEXT",
  PAYMENT_CONFIRMATION = "PAYMENT_CONFIRMATION",
  PAYMENT_PROOF = "PAYMENT_PROOF",
  PROBLEM_REPORT = "PROBLEM_REPORT",
  SOLUTION = "SOLUTION",
  SYSTEM = "SYSTEM",
}

export interface ChatAttachment {
  id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
}

export interface CreateTransferRequest {
  fromCurrency: Currency;
  toCurrency: Currency;
  fromAmount?: number;
  toAmount?: number;
  recipientInfo: RecipientInfo;
}

export interface ExchangeRate {
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: number;
  fees: number;
  lastUpdated: Date;
}

export interface SendChatMessageRequest {
  transferId: string;
  message: string;
  messageType: ChatMessageType;
  attachments?: File[];
}
