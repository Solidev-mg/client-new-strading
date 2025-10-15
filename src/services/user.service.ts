import apiClient from "@/services/api";

// Types pour les utilisateurs
export interface CreateClientRequest {
  lastname: string;
  firstname: string;
  tel: string;
  deliveryAddress: string;
  email: string;
  password: string;
}

export interface CreateAdminRequest extends CreateClientRequest {
  role: "SUPER_ADMIN" | "ADMIN";
}

export interface User {
  id: string;
  lastname: string;
  firstname: string;
  tel: string;
  deliveryAddress: string;
  email: string;
  clientCode?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export class UserService {
  /**
   * Créer un client
   */
  static async createClient(userData: CreateClientRequest): Promise<User> {
    try {
      const response = await apiClient.post<User>("/users/clients", userData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du client:", error);
      throw error;
    }
  }

  /**
   * Créer un administrateur
   */
  static async createAdmin(userData: CreateAdminRequest): Promise<User> {
    try {
      const response = await apiClient.post<User>("/users/admins", userData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de l'administrateur:", error);
      throw error;
    }
  }

  /**
   * Obtenir un utilisateur par email
   */
  static async getUserByEmail(email: string): Promise<User> {
    try {
      const response = await apiClient.get<User>(`/users/email/${email}`);
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'utilisateur par email:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtenir un utilisateur par ID
   */
  static async getUserById(id: string): Promise<User> {
    try {
      const response = await apiClient.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      throw error;
    }
  }

  /**
   * Mettre à jour un utilisateur
   */
  static async updateUser(
    id: string,
    userData: Partial<CreateClientRequest>
  ): Promise<User> {
    try {
      const response = await apiClient.put<User>(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      throw error;
    }
  }

  /**
   * Supprimer un utilisateur
   */
  static async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      throw error;
    }
  }
}
