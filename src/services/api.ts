import axios, { AxiosInstance, AxiosResponse } from "axios";
import { CookieService } from "./cookie.service";

// Configuration de l'API
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010/api";

// Instance axios avec configuration par défaut
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur de requêtes pour ajouter le token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const tokenData = CookieService.getTokenData();
      console.log("Token data from cookies:", tokenData);
      if (
        tokenData &&
        typeof tokenData === "object" &&
        "accessToken" in tokenData
      ) {
        config.headers.Authorization = `Bearer ${tokenData.accessToken}`;
        console.log(
          "Access token utilisé pour la requête:",
          tokenData.accessToken
        );
      } else {
        console.log("Aucun accessToken trouvé dans les cookies");
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponses pour gérer les erreurs et le refresh token
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("401 détecté, tentative de refresh du token");

      if (typeof window !== "undefined") {
        const tokenData = CookieService.getTokenData();
        if (
          tokenData &&
          typeof tokenData === "object" &&
          "refreshToken" in tokenData
        ) {
          console.log("Refresh token trouvé:", tokenData.refreshToken);
          try {
            // Tentative de refresh du token (utilise le refresh_token)
            const refreshResponse = await axios.post(
              `${API_BASE_URL}/auth/refresh`,
              {
                refresh_token: tokenData.refreshToken,
              },
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            const newTokenData = refreshResponse.data;
            console.log("Nouveau token obtenu:", newTokenData.accessToken);
            CookieService.setTokenData({
              accessToken: newTokenData.accessToken,
              refreshToken: newTokenData.refreshToken,
            });

            // Mettre à jour les données utilisateur si elles ont changé
            CookieService.setUserData(
              newTokenData.user as unknown as Record<string, unknown>
            );

            // Retry la requête originale avec le nouveau token
            originalRequest.headers.Authorization = `Bearer ${newTokenData.accessToken}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            console.error("Erreur lors du refresh du token:", refreshError);
            // Supprimer les tokens invalides
            CookieService.clearAuthData();
            // Rediriger vers la page de connexion
            window.location.href = "/auth/signin";
          }
        } else {
          console.log("Aucun refreshToken trouvé");
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
