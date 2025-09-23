import apiClient from "./api";

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
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    tel: string;
    clientCode: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UserProfile {
  id: string;
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
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw error;
    }
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  static async register(userData: RegisterRequest): Promise<TokenResponse> {
    try {
      // D'abord créer l'utilisateur
      await apiClient.post("/client-user", userData);

      // Ensuite se connecter automatiquement
      if (userData.email) {
        const loginResponse = await this.login({
          email: userData.email,
          password: userData.password,
        });
        return loginResponse;
      } else {
        throw new Error(
          "Email requis pour la connexion automatique après inscription"
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      throw error;
    }
  }

  /**
   * Rafraîchissement du token d'accès
   */
  static async refreshToken(
    refreshTokenRequest: RefreshTokenRequest
  ): Promise<TokenResponse> {
    try {
      const response = await apiClient.post<TokenResponse>(
        "/auth/refresh",
        refreshTokenRequest
      );
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
    }
  }

  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  static async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<UserProfile>("/auth/me");
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
}
