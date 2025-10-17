import apiClient from "./api";

export interface CreateDelayPricingRequest {
  delayMinDays: number;
  delayMaxDays: number;
  feeRate: number;
  fixedFee?: number;
  label: string;
  description?: string;
  color?: string;
  displayOrder?: number;
}

export interface DelayPricing {
  id: number;
  delayMinDays: number;
  delayMaxDays: number;
  feeRate: number;
  fixedFee: number;
  label: string;
  description?: string;
  color?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DelayPricingPaginatedResponse {
  items: DelayPricing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class DelayPricingService {
  /**
   * Créer une tarification de délai
   */
  static async createDelayPricing(
    pricingData: CreateDelayPricingRequest
  ): Promise<DelayPricing> {
    try {
      const response = await apiClient.post<DelayPricing>(
        "/delay-pricings",
        pricingData
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la création de la tarification de délai:",
        error
      );
      throw error;
    }
  }

  /**
   * Lister les tarifications de délai
   */
  static async getDelayPricings(
    page: number = 1,
    limit: number = 10,
    isActive?: boolean
  ): Promise<DelayPricingPaginatedResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (isActive !== undefined) {
        params.append("isActive", isActive.toString());
      }

      const response = await apiClient.get<DelayPricingPaginatedResponse>(
        `/delay-pricings?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des tarifications de délai:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtenir une tarification de délai par ID
   */
  static async getDelayPricingById(id: number): Promise<DelayPricing> {
    try {
      const response = await apiClient.get<DelayPricing>(
        `/delay-pricings/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la tarification de délai:",
        error
      );
      throw error;
    }
  }

  /**
   * Mettre à jour une tarification de délai
   */
  static async updateDelayPricing(
    id: number,
    pricingData: Partial<CreateDelayPricingRequest>
  ): Promise<DelayPricing> {
    try {
      const response = await apiClient.patch<DelayPricing>(
        `/delay-pricings/${id}`,
        pricingData
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour de la tarification de délai:",
        error
      );
      throw error;
    }
  }

  /**
   * Supprimer une tarification de délai
   */
  static async deleteDelayPricing(id: number): Promise<void> {
    try {
      await apiClient.delete(`/delay-pricings/${id}`);
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de la tarification de délai:",
        error
      );
      throw error;
    }
  }

  /**
   * Calculer les frais de délai
   */
  static async calculateDelayFee(
    delayPricingId: number,
    baseAmount: number,
    delayDays: number
  ): Promise<{ delayFee: number; totalAmount: number }> {
    try {
      const response = await apiClient.post<{
        delayFee: number;
        totalAmount: number;
      }>("/delay-pricings/calculate", {
        delayPricingId,
        baseAmount,
        delayDays,
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors du calcul des frais de délai:", error);
      throw error;
    }
  }
}
