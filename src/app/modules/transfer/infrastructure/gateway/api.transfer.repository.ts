import apiClient from "@/services/api";
import {
  ChatAttachment,
  ChatMessage,
  ChatMessageType,
  CreateTransferRequest,
  Currency,
  ExchangeRate,
  FromCurrency,
  RecipientInfo,
  SendChatMessageRequest,
  ToCurrency,
  Transfer,
  TransferPaymentMethod,
  TransferStatus,
} from "../../domain/entities/transfer.entity";
import { TransferRepository } from "../../domain/repositories/transfer.repository";

export class ApiTransferRepository implements TransferRepository {
  private readonly baseUrl = "/currency-transfers";

  private mapTransferData(data: Record<string, unknown>): Transfer {
    return {
      id: data.id as string,
      userId: data.userId as string,
      fromCurrency: data.fromCurrency as FromCurrency,
      toCurrency: data.toCurrency as ToCurrency,
      fromAmount: Number(data.fromAmount),
      toAmount: Number(data.toAmount),
      exchangeRate: (data.appliedRate || data.exchangeRate) as number,
      fees: Number(data.fees || 0),
      totalAmount: Number(data.totalAmount || 0),
      paymentMethod: data.paymentMethod as TransferPaymentMethod,
      recipientInfo: data.recipientInfo as RecipientInfo,
      status: data.status as TransferStatus,
      paymentProof: data.paymentProof as string | undefined,
      adminNotes: data.adminNotes as string | undefined,
      createdAt: new Date(data.createdAt as string),
      updatedAt: new Date(data.updatedAt as string),
      completedAt: data.completedAt
        ? new Date(data.completedAt as string)
        : undefined,
      chatMessages: (data.chatMessages as ChatMessage[]) || [],
    };
  }

  private mapExchangeRateData(data: Record<string, unknown>): ExchangeRate {
    return {
      fromCurrency: data.fromCurrency as Currency,
      toCurrency: data.toCurrency as Currency,
      rate: data.rate as number,
      fees: data.fees as number,
      lastUpdated: new Date(data.lastUpdated as string),
    };
  }

  private mapChatMessageData(data: Record<string, unknown>): ChatMessage {
    return {
      id: data.id as string,
      transferId: data.transferId as string,
      senderId: data.senderId as string,
      senderType: data.senderType as "USER" | "ADMIN",
      message: data.message as string,
      messageType: data.messageType as ChatMessageType,
      attachments: (data.attachments as ChatAttachment[]) || undefined,
      createdAt: new Date(data.createdAt as string),
    };
  }

  async getTransfers(): Promise<Transfer[]> {
    try {
      const response = await apiClient.get(this.baseUrl);
      const transfers = Array.isArray(response.data)
        ? response.data
        : response.data.data || response.data.transfers || [];

      return transfers.map((transfer: Record<string, unknown>) =>
        this.mapTransferData(transfer)
      );
    } catch (error) {
      console.error("Error fetching transfers:", error);
      throw error;
    }
  }

  async getTransferById(id: string): Promise<Transfer | null> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return response.data ? this.mapTransferData(response.data) : null;
    } catch (error) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status: number } };
        if (axiosError.response?.status === 404) {
          return null;
        }
      }
      console.error("Error fetching transfer:", error);
      throw error;
    }
  }

  async createTransfer(transferData: CreateTransferRequest): Promise<Transfer> {
    try {
      const response = await apiClient.post(this.baseUrl, transferData);
      return this.mapTransferData(response.data);
    } catch (error) {
      console.error("Error creating transfer:", error);
      throw error;
    }
  }

  async getExchangeRates(): Promise<ExchangeRate[]> {
    try {
      const response = await apiClient.get("/exchange-rates");
      const rates = Array.isArray(response.data)
        ? response.data
        : response.data.data || response.data.rates || [];

      return rates.map((rate: Record<string, unknown>) =>
        this.mapExchangeRateData(rate)
      );
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      throw error;
    }
  }

  async getExchangeRate(
    fromCurrency: Currency,
    toCurrency: Currency
  ): Promise<ExchangeRate> {
    try {
      const response = await apiClient.get(
        `/exchange-rates/${fromCurrency}/${toCurrency}`
      );
      return this.mapExchangeRateData(response.data);
    } catch (error) {
      console.error(
        `Error fetching exchange rate ${fromCurrency} to ${toCurrency}:`,
        error
      );
      throw error;
    }
  }

  async sendChatMessage(
    messageData: SendChatMessageRequest
  ): Promise<ChatMessage> {
    try {
      const response = await apiClient.post("/chat-messages", messageData);
      return this.mapChatMessageData(response.data);
    } catch (error) {
      console.warn(
        "API endpoint POST /chat-messages not available, simulating message:",
        error
      );

      // Simulate chat message creation
      const newMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        transferId: messageData.transferId,
        senderId: "user1",
        senderType: "USER",
        message: messageData.message,
        messageType: messageData.messageType,
        attachments: messageData.attachments?.map((file, index) => ({
          id: `att_${Date.now()}_${index}`,
          filename: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
          size: file.size,
        })),
        createdAt: new Date(),
      };

      return newMessage;
    }
  }

  async getChatMessages(transferId: string): Promise<ChatMessage[]> {
    try {
      const response = await apiClient.get(`/chat-messages/${transferId}`);
      const messages = Array.isArray(response.data)
        ? response.data
        : response.data.data || response.data.messages || [];

      return messages.map((message: Record<string, unknown>) =>
        this.mapChatMessageData(message)
      );
    } catch (error) {
      console.warn(
        `API endpoint /chat-messages/${transferId} not available, returning empty messages:`,
        error
      );
      return [];
    }
  }

  async uploadPaymentProof(transferId: string, file: File): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      await apiClient.post(
        `${this.baseUrl}/${transferId}/payment-proof`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return true;
    } catch (error) {
      console.error("Error uploading payment proof:", error);
      throw error;
    }
  }
}
