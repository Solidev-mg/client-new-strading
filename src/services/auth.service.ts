import apiClient from "./api";
import { CookieService } from "./cookie.service";

// Types pour l'authentification basés sur les DTOs du backend
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  lastname: string;
  firstname: string;
  tel: string;
  deliveryAddress: string;
  email?: string;
  password: string;
  clientCode?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number; // Changé de string à number
    email: string;
    firstname: string;
    lastname: string;
    tel: string;
    clientCode: string;
  };
}

export interface UserProfile {
  id: number; // Changé de string à number
  email: string;
  firstname: string;
  lastname: string;
  tel: string;
  clientCode: string;
}

export class AuthService {
  /**
   * Connexion avec email et mot de passe
   */
  static async login(credentials: LoginRequest): Promise<TokenResponse> {
    try {
      const response = await apiClient.post<TokenResponse>(
        "/auth/login",
        credentials
      );

      console.log("Réponse de login:", response.data);

      // Stocker le token et les données utilisateur dans les cookies
      if (typeof window !== "undefined") {
        CookieService.setTokenData(
          response.data as unknown as Record<string, unknown>
        );
        CookieService.setUserData(
          response.data.user as unknown as Record<string, unknown>
        );
        console.log("Tokens stockés après connexion:", response.data);
      }

      return response.data;
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw error;
    }
  }

  /**
   * Inscription d'un nouvel utilisateur (client)
   */
  static async register(userData: RegisterRequest): Promise<TokenResponse> {
    try {
      // Créer l'utilisateur client
      const response = await apiClient.post<TokenResponse>(
        "/auth/signup",
        userData
      );

      // Stocker le token et les données utilisateur dans les cookies
      if (typeof window !== "undefined") {
        CookieService.setTokenData(
          response.data as unknown as Record<string, unknown>
        );
        CookieService.setUserData(
          response.data.user as unknown as Record<string, unknown>
        );
      }

      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      throw error;
    }
  }

  /**
   * Créer un utilisateur client
   */
  static async createClient(userData: RegisterRequest): Promise<UserProfile> {
    try {
      const response = await apiClient.post<UserProfile>(
        "/users/clients",
        userData
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du client:", error);
      throw error;
    }
  }

  /**
   * Créer un administrateur (nécessite des droits admin)
   */
  static async createAdmin(
    userData: RegisterRequest & { role: string }
  ): Promise<UserProfile> {
    try {
      const response = await apiClient.post<UserProfile>(
        "/users/admins",
        userData
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de l'administrateur:", error);
      throw error;
    }
  }

  /**
   * Rafraîchissement du token d'accès
   */
  static async refreshToken(): Promise<TokenResponse> {
    try {
      const response = await apiClient.post<TokenResponse>("/auth/refresh");
      return response.data;
    } catch (error) {
      console.error("Erreur lors du refresh du token:", error);
      throw error;
    }
  }

  /**
   * Déconnexion
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // Ne pas rejeter l'erreur car on veut quand même supprimer les tokens locaux
    } finally {
      // Toujours nettoyer le localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }

  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  static async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<UserProfile>("/auth/profile");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      throw error;
    }
  }

  /**
   * Initier la connexion Google OAuth
   */
  static getGoogleAuthUrl(): string {
    return `${apiClient.defaults.baseURL}/auth/google`;
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  static isLoggedIn(): boolean {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("token");
    return !!token;
  }

  /**
   * Récupérer le token stocké
   */
  static getStoredToken(): TokenResponse | null {
    if (typeof window === "undefined") return null;
    try {
      const token = localStorage.getItem("token");
      return token ? JSON.parse(token) : null;
    } catch (error) {
      console.error("Erreur lors de la récupération du token:", error);
      return null;
    }
  }

  /**
   * Récupérer l'utilisateur stocké
   */
  static getStoredUser(): UserProfile | null {
    if (typeof window === "undefined") return null;
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      return null;
    }
  }
}
