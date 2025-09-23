import { useCallback, useState } from "react";

interface NetworkError {
  message: string;
  isOffline: boolean;
  isServerError: boolean;
}

export const useNetworkError = () => {
  const [networkError, setNetworkError] = useState<NetworkError | null>(null);

  const handleNetworkError = useCallback((error: unknown) => {
    const axiosError = error as {
      response?: { status?: number; data?: { message?: string } };
      code?: string;
      message?: string;
    };

    if (
      axiosError.code === "ECONNREFUSED" ||
      axiosError.message?.includes("Network Error")
    ) {
      setNetworkError({
        message:
          "Le serveur n'est pas accessible. Vérifiez que le backend est démarré.",
        isOffline: true,
        isServerError: false,
      });
    } else if (
      axiosError.response?.status &&
      axiosError.response.status >= 500
    ) {
      setNetworkError({
        message: "Erreur serveur. Veuillez réessayer dans quelques instants.",
        isOffline: false,
        isServerError: true,
      });
    } else {
      setNetworkError(null);
    }
  }, []);

  const clearNetworkError = useCallback(() => {
    setNetworkError(null);
  }, []);

  return {
    networkError,
    handleNetworkError,
    clearNetworkError,
  };
};
