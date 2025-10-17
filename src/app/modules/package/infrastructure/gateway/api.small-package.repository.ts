import apiClient from "@/services/api";
import {
  CreateInitialSmallPackageRequest,
  PackageHistory,
  SmallPackage,
  SmallPackageFilter,
  SmallPackagePaginatedResponse,
} from "../../domain/entities/small-package.entity";
import { SmallPackageRepository } from "../../domain/repositories/small-package.repository";

export class ApiSmallPackageRepository implements SmallPackageRepository {
  async getSmallPackages(
    filter?: SmallPackageFilter
  ): Promise<SmallPackagePaginatedResponse> {
    try {
      const params = new URLSearchParams();

      if (filter?.status) {
        params.append("status", filter.status);
      }
      if (filter?.searchTerm) {
        params.append("search", filter.searchTerm);
      }
      if (filter?.deliveryModeId) {
        params.append("deliveryModeId", filter.deliveryModeId);
      }
      if (filter?.clientUserId) {
        params.append("clientUserId", filter.clientUserId.toString());
      }
      if (filter?.dateFrom) {
        params.append("dateFrom", filter.dateFrom.toISOString());
      }
      if (filter?.dateTo) {
        params.append("dateTo", filter.dateTo.toISOString());
      }
      if (filter?.limit) {
        params.append("limit", filter.limit.toString());
      }
      if (filter?.offset) {
        params.append("offset", filter.offset.toString());
      }

      const response = await apiClient.get(
        `/small-packages?${params.toString()}`
      );

      console.log("ApiSmallPackageRepository - raw response:", response.data);

      // Gérer le cas où l'API retourne directement un tableau (findAll)
      // ou un objet paginé (search)
      if (Array.isArray(response.data)) {
        return {
          items: response.data,
          total: response.data.length,
          limit: response.data.length,
          offset: 0,
        };
      }

      // Le backend renvoie { data: [], total, page, limit, totalPages }
      const result = {
        items: response.data.data || response.data.items || [],
        total: response.data.total || 0,
        limit: response.data.limit || 10,
        offset: response.data.offset || 0,
      };

      console.log("ApiSmallPackageRepository - transformed result:", result);

      return result;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des small packages:",
        error
      );
      throw error;
    }
  }

  async getSmallPackageById(id: string): Promise<SmallPackage | null> {
    try {
      const response = await apiClient.get(`/small-packages/${id}`);
      return response.data;
    } catch (error) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          return null;
        }
      }
      console.error("Erreur lors de la récupération du small package:", error);
      throw error;
    }
  }

  async getSmallPackageByTrackingCode(
    trackingCode: string
  ): Promise<SmallPackage | null> {
    try {
      const response = await apiClient.get(
        `/small-packages/tracking/${trackingCode}`
      );
      return response.data;
    } catch (error) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          return null;
        }
      }
      console.error(
        "Erreur lors de la récupération du small package par code de suivi:",
        error
      );
      throw error;
    }
  }

  async checkTrackingCodeExists(trackingCode: string): Promise<boolean> {
    try {
      const response = await apiClient.get(
        `/small-packages/tracking/${trackingCode}/exists`
      );
      return response.data.exists;
    } catch (error) {
      console.error("Erreur lors de la vérification du code de suivi:", error);
      return false;
    }
  }

  async createInitialSmallPackage(
    packageData: CreateInitialSmallPackageRequest
  ): Promise<SmallPackage> {
    try {
      const response = await apiClient.post("/small-packages", packageData);
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la création du small package initial:",
        error
      );
      throw error;
    }
  }

  async getSmallPackageHistory(packageId: string): Promise<SmallPackage> {
    try {
      const response = await apiClient.get(
        `/small-packages/${packageId}/history`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'historique du small package:",
        error
      );
      throw error;
    }
  }

  async searchSmallPackages(params: {
    trackingCode?: string;
    clientCode?: string;
    statusId?: string;
    page?: number;
    limit?: number;
  }): Promise<SmallPackagePaginatedResponse> {
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

      const response = await apiClient.get(
        `/small-packages/search?${searchParams.toString()}`
      );

      // L'API retourne { data, total, page, limit, totalPages }
      return {
        items: response.data.data || [],
        total: response.data.total || 0,
        limit: response.data.limit || 20,
        offset: ((response.data.page || 1) - 1) * (response.data.limit || 20),
      };
    } catch (error) {
      console.error("Erreur lors de la recherche des colis:", error);
      throw error;
    }
  }

  async changeDeliveryMode(
    packageId: string,
    newDeliveryModeId: string
  ): Promise<SmallPackage> {
    try {
      const response = await apiClient.put(
        `/small-packages/${packageId}/change-delivery-mode/${newDeliveryModeId}`
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors du changement de mode de livraison:", error);
      throw error;
    }
  }

  async renamePackage(
    packageId: string,
    newName: string
  ): Promise<SmallPackage> {
    try {
      const response = await apiClient.put(
        `/small-packages/${packageId}/rename`,
        { newName }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors du renommage du colis:", error);
      throw error;
    }
  }

  async getPackageHistoryById(packageId: string): Promise<PackageHistory[]> {
    try {
      const response = await apiClient.get(
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
}
