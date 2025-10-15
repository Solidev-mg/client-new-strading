import apiClient from "@/services/api";

// Types pour les packages
export interface SmallPackage {
  id: string;
  userId: string;
  deliveryModeId: string;
  trackingCode: string;
  packageName: string;
  statusId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSmallPackageRequest {
  userId: number;
  deliveryModeId: string;
  trackingCode: string;
  packageName: string;
}

export interface SearchSmallPackageParams {
  trackingCode?: string;
  clientCode?: string;
  statusId?: string;
  page?: number;
  limit?: number;
}

export interface SearchSmallPackageResponse {
  data: SmallPackage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RenamePackageRequest {
  newName: string;
}

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

export class SmallPackageService {
  /**
   * Créer un petit colis
   */
  static async createSmallPackage(
    packageData: CreateSmallPackageRequest
  ): Promise<SmallPackage> {
    try {
      const response = await apiClient.post<SmallPackage>(
        "/small-packages",
        packageData
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du petit colis:", error);
      throw error;
    }
  }

  /**
   * Rechercher des colis avec filtres
   */
  static async searchSmallPackages(
    params: SearchSmallPackageParams
  ): Promise<SearchSmallPackageResponse> {
    try {
      const searchParams = new URLSearchParams();

      if (params.trackingCode) {
        searchParams.append("trackingCode", params.trackingCode);
      }
      if (params.clientCode) {
        searchParams.append("clientCode", params.clientCode);
      }
      if (params.statusId) {
        searchParams.append("statusId", params.statusId);
      }
      if (params.page) {
        searchParams.append("page", params.page.toString());
      }
      if (params.limit) {
        searchParams.append("limit", params.limit.toString());
      }

      const response = await apiClient.get<SearchSmallPackageResponse>(
        `/small-packages/search?${searchParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la recherche des colis:", error);
      throw error;
    }
  }

  /**
   * Obtenir un colis par ID
   */
  static async getSmallPackageById(id: string): Promise<SmallPackage> {
    try {
      const response = await apiClient.get<SmallPackage>(
        `/small-packages/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du colis:", error);
      throw error;
    }
  }

  /**
   * Obtenir un colis par code de suivi
   */
  static async getSmallPackageByTrackingCode(
    trackingCode: string
  ): Promise<SmallPackage> {
    try {
      const response = await apiClient.get<SmallPackage>(
        `/small-packages/tracking/${trackingCode}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du colis par code de suivi:",
        error
      );
      throw error;
    }
  }

  /**
   * Changer le mode de livraison d'un colis
   */
  static async changeDeliveryMode(
    packageId: string,
    newDeliveryModeId: string
  ): Promise<SmallPackage> {
    try {
      const response = await apiClient.put<SmallPackage>(
        `/small-packages/${packageId}/change-delivery-mode/${newDeliveryModeId}`
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors du changement de mode de livraison:", error);
      throw error;
    }
  }

  /**
   * Renommer un colis
   */
  static async renamePackage(
    packageId: string,
    newName: string
  ): Promise<SmallPackage> {
    try {
      const response = await apiClient.put<SmallPackage>(
        `/small-packages/${packageId}/rename`,
        { newName }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors du renommage du colis:", error);
      throw error;
    }
  }

  /**
   * Obtenir l'historique d'un colis
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
   * Obtenir tous les colis (pour administration)
   */
  static async getAllSmallPackages(
    page = 1,
    limit = 10
  ): Promise<SearchSmallPackageResponse> {
    try {
      const response = await apiClient.get<SearchSmallPackageResponse>(
        `/small-packages?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de tous les colis:", error);
      throw error;
    }
  }
}
