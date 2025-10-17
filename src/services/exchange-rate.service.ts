import apiClient from "./api";

export interface CreateExchangeRateRequest {
  fromCurrency?: string; // Défaut: "MGA"
  toCurrency: "USD" | "CNY";
  rate: number;
  createdBy?: number;
}

export interface ExchangeRate {
  id: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  isActive: boolean;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRatePaginatedResponse {
  items: ExchangeRate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ExchangeRateService {
  /**
   * Créer un taux de change
   */
  static async createExchangeRate(
    rateData: CreateExchangeRateRequest
  ): Promise<ExchangeRate> {
    try {
      const response = await apiClient.post<ExchangeRate>(
        "/exchange-rates",
        rateData
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du taux de change:", error);
      throw error;
    }
  }

  /**
   * Lister les taux de change
   */
  static async getExchangeRates(
    page: number = 1,
    limit: number = 10,
    toCurrency?: "USD" | "CNY",
    isActive?: boolean
  ): Promise<ExchangeRatePaginatedResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (toCurrency) {
        params.append("toCurrency", toCurrency);
      }

      if (isActive !== undefined) {
        params.append("isActive", isActive.toString());
      }

      const response = await apiClient.get<ExchangeRatePaginatedResponse>(
        `/exchange-rates?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des taux de change:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtenir le dernier taux de change actif
   */
  static async getLatestExchangeRate(
    toCurrency: "USD" | "CNY"
  ): Promise<ExchangeRate> {
    try {
      const response = await apiClient.get<ExchangeRate>(
        `/exchange-rates/latest/${toCurrency}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du dernier taux de change:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtenir l'historique des taux de change
   */
  static async getExchangeRateHistory(
    toCurrency: "USD" | "CNY",
    page: number = 1,
    limit: number = 10
  ): Promise<ExchangeRatePaginatedResponse> {
    try {
      const response = await apiClient.get<ExchangeRatePaginatedResponse>(
        `/exchange-rates/history/${toCurrency}?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'historique des taux:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtenir un taux de change par ID
   */
  static async getExchangeRateById(id: number): Promise<ExchangeRate> {
    try {
      const response = await apiClient.get<ExchangeRate>(
        `/exchange-rates/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du taux de change:", error);
      throw error;
    }
  }

  /**
   * Mettre à jour un taux de change
   */
  static async updateExchangeRate(
    id: number,
    rateData: Partial<CreateExchangeRateRequest> & { isActive?: boolean }
  ): Promise<ExchangeRate> {
    try {
      const response = await apiClient.patch<ExchangeRate>(
        `/exchange-rates/${id}`,
        rateData
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du taux de change:", error);
      throw error;
    }
  }

  /**
   * Supprimer un taux de change
   */
  static async deleteExchangeRate(id: number): Promise<void> {
    try {
      await apiClient.delete(`/exchange-rates/${id}`);
    } catch (error) {
      console.error("Erreur lors de la suppression du taux de change:", error);
      throw error;
    }
  }

  /**
   * Convertir un montant
   */
  static async convertAmount(
    amount: number,
    fromCurrency: string,
    toCurrency: "USD" | "CNY"
  ): Promise<{ convertedAmount: number; rate: number }> {
    try {
      const response = await apiClient.post<{
        convertedAmount: number;
        rate: number;
      }>("/exchange-rates/convert", {
        amount,
        fromCurrency,
        toCurrency,
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la conversion du montant:", error);
      throw error;
    }
  }
}
