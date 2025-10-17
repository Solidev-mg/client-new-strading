import apiClient from "./api";

export interface InvoiceDetail {
  smallPackageId: number;
  description: string;
  quantite: number;
  prixUnitaire: number;
}

export interface CreateInvoiceRequest {
  numeroFacture: string;
  userId: number;
  dateFacture: string;
  statut: "EN_ATTENTE" | "PAYEE" | "ANNULEE";
  notes?: string;
  details: InvoiceDetail[];
}

export interface Invoice {
  id: number;
  numeroFacture: string;
  userId: number;
  dateFacture: string;
  statut: string;
  montantTotal: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  details?: InvoiceDetail[];
}

export interface InvoicePaginatedResponse {
  items: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class InvoiceService {
  /**
   * Créer une facture avec détails
   */
  static async createInvoice(
    invoiceData: CreateInvoiceRequest
  ): Promise<Invoice> {
    try {
      const response = await apiClient.post<Invoice>("/invoices", invoiceData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de la facture:", error);
      throw error;
    }
  }

  /**
   * Obtenir les factures d'un client
   */
  static async getInvoicesByClient(
    clientId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<InvoicePaginatedResponse> {
    try {
      const response = await apiClient.get<InvoicePaginatedResponse>(
        `/invoices/client/${clientId}?page=${page}&limit=${limit}`
      );

      console.log(
        "InvoiceService.getInvoicesByClient - raw response:",
        response.data
      );

      // Le backend renvoie { data: [...], total, page, limit, totalPages }
      const rawData = response.data as unknown as {
        data?: Invoice[];
        items?: Invoice[];
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
      };

      const result = {
        items: rawData?.data || rawData?.items || [],
        total: rawData?.total || 0,
        page: rawData?.page || page,
        limit: rawData?.limit || limit,
        totalPages: rawData?.totalPages || 1,
      };

      console.log(
        "InvoiceService.getInvoicesByClient - transformed result:",
        result
      );

      return result;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des factures du client:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtenir une facture par ID
   */
  static async getInvoiceById(id: number): Promise<Invoice> {
    try {
      const response = await apiClient.get<Invoice>(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de la facture:", error);
      throw error;
    }
  }

  /**
   * Générer le PDF d'une facture
   */
  static async generateInvoicePdf(id: number): Promise<Blob> {
    try {
      const response = await apiClient.get(`/invoices/${id}/pdf`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la génération du PDF de la facture:",
        error
      );
      throw error;
    }
  }

  /**
   * Télécharger le PDF d'une facture
   */
  static async downloadInvoicePdf(
    id: number,
    filename?: string
  ): Promise<void> {
    try {
      const blob = await this.generateInvoicePdf(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || `facture-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Erreur lors du téléchargement du PDF de la facture:",
        error
      );
      throw error;
    }
  }

  /**
   * Mettre à jour le statut d'une facture
   */
  static async updateInvoiceStatus(
    id: number,
    statut: "EN_ATTENTE" | "PAYEE" | "ANNULEE"
  ): Promise<Invoice> {
    try {
      const response = await apiClient.patch<Invoice>(`/invoices/${id}`, {
        statut,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du statut de la facture:",
        error
      );
      throw error;
    }
  }
}
