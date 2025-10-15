import apiClient from "@/services/api";

export interface PackageHistory {
  id: string;
  packageId: string;
  action: string;
  description: string;
  createdAt: string;
  user?: {
    id: string;
    firstname: string;
    lastname: string;
  };
}

export class PackageHistoryService {
  /**
   * Obtenir l'historique d'un colis spécifique
   */
  static async getPackageHistory(packageId: string): Promise<PackageHistory[]> {
    try {
      const response = await apiClient.get<PackageHistory[]>(
        `/package-histories/package/${packageId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'historique du colis:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtenir un historique spécifique par ID
   */
  static async getHistoryById(historyId: string): Promise<PackageHistory> {
    try {
      const response = await apiClient.get<PackageHistory>(
        `/package-histories/${historyId}`
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique:", error);
      throw error;
    }
  }

  /**
   * Obtenir tous les historiques avec pagination
   */
  static async getAllHistories(
    page = 1,
    limit = 10
  ): Promise<{
    data: PackageHistory[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const response = await apiClient.get(
        `/package-histories?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de tous les historiques:",
        error
      );
      throw error;
    }
  }
}
