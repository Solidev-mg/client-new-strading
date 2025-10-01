import apiClient from "@/services/api";
import {
  CreateInitialSmallPackageRequest,
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
        params.append("clientUserId", filter.clientUserId);
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

      return {
        items: response.data.items || [],
        total: response.data.total || 0,
        limit: response.data.limit || 10,
        offset: response.data.offset || 0,
      };
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

  async createInitialSmallPackage(
    packageData: CreateInitialSmallPackageRequest
  ): Promise<SmallPackage> {
    try {
      const response = await apiClient.post(
        "/small-packages/initial",
        packageData
      );
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
}
