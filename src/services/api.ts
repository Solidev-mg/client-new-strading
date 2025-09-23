import axios, { AxiosInstance, AxiosResponse } from "axios";

// Configuration de l'API
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Instance axios avec configuration par défaut
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur de requêtes pour ajouter le token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const tokenData = JSON.parse(token);
          config.headers.Authorization = `Bearer ${tokenData.accessToken}`;
        } catch (error) {
          console.error("Erreur lors du parsing du token:", error);
        }
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

      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const tokenData = JSON.parse(token);
            if (tokenData.refreshToken) {
              // Tentative de refresh du token
              const refreshResponse = await axios.post(
                `${API_BASE_URL}/auth/refresh`,
                { refreshToken: tokenData.refreshToken }
              );

              const newTokenData = refreshResponse.data;
              localStorage.setItem("token", JSON.stringify(newTokenData));

              // Retry la requête originale avec le nouveau token
              originalRequest.headers.Authorization = `Bearer ${newTokenData.accessToken}`;
              return apiClient(originalRequest);
            }
          } catch (refreshError) {
            console.error("Erreur lors du refresh du token:", refreshError);
            // Supprimer les tokens invalides
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Rediriger vers la page de connexion
            window.location.href = "/auth/signin";
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
