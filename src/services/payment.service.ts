import apiClient from "./api";

export interface CreatePaymentRequest {
  invoiceId: number;
  userId: number;
  paymentMethod: "MOBILE_MONEY" | "CASH" | "BANK_TRANSFER";
  delayPricingId: number;
  dueDate: string;
  delayDays: number;
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
  notes?: string;
}

export interface Payment {
  id: number;
  invoiceId: number;
  userId: number;
  paymentMethod: string;
  amount: number;
  delayPricingId: number;
  dueDate: string;
  delayDays: number;
  delayFee: number;
  totalAmount: number;
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentPaginatedResponse {
  items: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PaymentService {
  /**
   * Créer un paiement
   */
  static async createPayment(
    paymentData: CreatePaymentRequest
  ): Promise<Payment> {
    try {
      const response = await apiClient.post<Payment>("/payments", paymentData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du paiement:", error);
      throw error;
    }
  }

  /**
   * Obtenir les paiements d'un client
   */
  static async getPaymentsByClient(
    clientId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<PaymentPaginatedResponse> {
    try {
      const response = await apiClient.get<PaymentPaginatedResponse>(
        `/payments/client/${clientId}?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des paiements du client:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtenir un paiement par ID
   */
  static async getPaymentById(id: number): Promise<Payment> {
    try {
      const response = await apiClient.get<Payment>(`/payments/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du paiement:", error);
      throw error;
    }
  }

  /**
   * Mettre à jour le statut d'un paiement
   */
  static async updatePaymentStatus(
    id: number,
    status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED"
  ): Promise<Payment> {
    try {
      const response = await apiClient.patch<Payment>(`/payments/${id}`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du statut du paiement:",
        error
      );
      throw error;
    }
  }
}
