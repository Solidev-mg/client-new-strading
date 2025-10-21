import apiClient from "@/services/api";

export interface DeliveryMode {
  id: number;
  mode: string;
  fee: number;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Status {
  id: number;
  name: string;
  description: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeliveryModeRequest {
  mode: string;
  fee: number;
  description?: string;
  active?: boolean;
}

export interface CreateStatusRequest {
  name: string;
  description: string;
  color?: string;
}

export class ReferenceDataService {
  /**
   * Obtenir tous les modes de livraison
   */
  static async getDeliveryModes(): Promise<DeliveryMode[]> {
    try {
      const response = await apiClient.get<DeliveryMode[]>(
        "/reference-data/delivery-modes/all"
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des modes de livraison:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtenir un mode de livraison par ID
   */
  static async getDeliveryModeById(id: string): Promise<DeliveryMode> {
    try {
      const response = await apiClient.get<DeliveryMode>(
        `/reference-data/delivery-modes/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du mode de livraison:",
        error
      );
      throw error;
    }
  }

  /**
   * Créer un nouveau mode de livraison
   */
  static async createDeliveryMode(
    data: CreateDeliveryModeRequest
  ): Promise<DeliveryMode> {
    try {
      const response = await apiClient.post<DeliveryMode>(
        "/reference-data/delivery-modes",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du mode de livraison:", error);
      throw error;
    }
  }

  /**
   * Mettre à jour un mode de livraison
   */
  static async updateDeliveryMode(
    id: string,
    data: Partial<CreateDeliveryModeRequest>
  ): Promise<DeliveryMode> {
    try {
      const response = await apiClient.put<DeliveryMode>(
        `/reference-data/delivery-modes/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du mode de livraison:",
        error
      );
      throw error;
    }
  }

  /**
   * Supprimer un mode de livraison
   */
  static async deleteDeliveryMode(id: string): Promise<void> {
    try {
      await apiClient.delete(`/reference-data/delivery-modes/${id}`);
    } catch (error) {
      console.error(
        "Erreur lors de la suppression du mode de livraison:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtenir tous les statuts
   */
  static async getStatuses(): Promise<Status[]> {
    try {
      const response = await apiClient.get<Status[]>(
        "/reference-data/statuses/all"
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des statuts:", error);
      throw error;
    }
  }

  /**
   * Obtenir un statut par ID
   */
  static async getStatusById(id: string): Promise<Status> {
    try {
      const response = await apiClient.get<Status>(
        `/reference-data/statuses/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du statut:", error);
      throw error;
    }
  }

  /**
   * Créer un nouveau statut
   */
  static async createStatus(data: CreateStatusRequest): Promise<Status> {
    try {
      const response = await apiClient.post<Status>(
        "/reference-data/statuses",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du statut:", error);
      throw error;
    }
  }

  /**
   * Mettre à jour un statut
   */
  static async updateStatus(
    id: string,
    data: Partial<CreateStatusRequest>
  ): Promise<Status> {
    try {
      const response = await apiClient.put<Status>(
        `/reference-data/statuses/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      throw error;
    }
  }

  /**
   * Supprimer un statut
   */
  static async deleteStatus(id: string): Promise<void> {
    try {
      await apiClient.delete(`/reference-data/statuses/${id}`);
    } catch (error) {
      console.error("Erreur lors de la suppression du statut:", error);
      throw error;
    }
  }
}
