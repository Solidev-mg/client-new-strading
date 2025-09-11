import {
  ChatMessage,
  CreateTransferRequest,
  Currency,
  ExchangeRate,
  SendChatMessageRequest,
  Transfer,
} from "../entities/transfer.entity";

export interface TransferRepository {
  getTransfers(): Promise<Transfer[]>;
  getTransferById(id: string): Promise<Transfer | null>;
  createTransfer(transferData: CreateTransferRequest): Promise<Transfer>;
  getExchangeRates(): Promise<ExchangeRate[]>;
  getExchangeRate(
    fromCurrency: Currency,
    toCurrency: Currency
  ): Promise<ExchangeRate>;
  sendChatMessage(messageData: SendChatMessageRequest): Promise<ChatMessage>;
  getChatMessages(transferId: string): Promise<ChatMessage[]>;
  uploadPaymentProof(transferId: string, file: File): Promise<boolean>;
}
