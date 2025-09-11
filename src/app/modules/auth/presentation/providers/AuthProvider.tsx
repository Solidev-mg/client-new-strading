"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { User } from "../../../user/domain/entities/user.entity";
import { AuthCredentials, Token } from "../../domain/entities/auth.entity";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  authInfos: User | null;
  tokenInfos: Token | null;
  setTokenInfos: (tokenInfos: Token | null) => void;
  setAuthInfos: (authInfos: User | null) => void;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  isSubmitted: boolean;
  setIsSubmitted: (boolean: boolean) => void;
  isSuccess: boolean;
  validateResetToken: (token: string) => Promise<boolean>;
  error: string;
  setError: (error: string) => void;
  isValidToken: boolean | null;
  logout: () => void;
  message: string | null;
}

interface RegisterData {
  fullName: string;
  phoneNumber: string;
  deliveryAddress: string;
  email?: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authInfos, setAuthInfos] = useState<User | null>(null);
  const [tokenInfos, setTokenInfos] = useState<Token | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const currentPath = window.location.pathname;

    if (token && user) {
      // Si l'utilisateur est déjà sur la page de login ou d'inscription, on le redirige
      if (currentPath === "/auth/signin") {
        router.replace("/dashboard");
      }
      setTokenInfos(JSON.parse(token));
      setAuthInfos(JSON.parse(user));
    } else {
      // Si pas de token/user mais sur une page protégée, rediriger vers login
      if (
        !currentPath.startsWith("/public") &&
        currentPath !== "/auth/signin" &&
        currentPath !== "/auth/register" &&
        currentPath !== "/auth/forgot-password"
      ) {
        router.replace("/auth/signin");
      }
    }
  }, [router]);

  const validateResetToken = useCallback(async (token: string) => {
    try {
      // Simulation - dans une vraie app, faire un appel API
      console.log("Validating token:", token);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsValidToken(true);
      return true;
    } catch (error) {
      setIsValidToken(false);
      throw error;
    }
  }, []);

  const login = useCallback(
    async (credentials: AuthCredentials) => {
      setIsLoading(true);
      setMessage(null);

      try {
        // Simulation d'un appel API - connexion automatique pour l'intégration
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Pour l'intégration, on accepte n'importe quel email/mot de passe (même vides)
        const mockUser: User = {
          id: "1",
          email: credentials.email || "demo@strading.com",
          firstName: "Utilisateur",
          lastName: "Demo",
        };

        const mockToken: Token = {
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
        };

        // Stockage des informations d'authentification
        localStorage.setItem("token", JSON.stringify(mockToken));
        localStorage.setItem("user", JSON.stringify(mockUser));

        setAuthInfos(mockUser);
        setTokenInfos(mockToken);
        setMessage(null);
        router.replace("/dashboard");

        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        setMessage("Une erreur inattendue est survenue. Veuillez réessayer.");
        console.error("Erreur lors de la connexion :", error);
      }
    },
    [router]
  );

  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      // Simulation d'un appel API
      console.log("Sending reset email to:", email);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
      setIsSubmitted(true);
      return true;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulation d'un appel API
      console.log(
        "Resetting password with token:",
        token,
        "and password length:",
        password.length
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
      setIsSuccess(true);
      setIsSubmitted(true);
      return true;
    } catch (error) {
      setIsLoading(false);
      setIsSuccess(false);
      setError("Failed to reset password");
      throw error;
    }
  }, []);

  const register = useCallback(
    async (userData: RegisterData) => {
      setIsLoading(true);
      setMessage(null);

      try {
        // Simulation d'un appel API d'inscription - remplacez par votre vraie logique
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Pour la demo, on crée automatiquement un compte
        const mockUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email: userData.email || `${userData.phoneNumber}@strading.com`,
          firstName: userData.fullName.split(" ")[0],
          lastName: userData.fullName.split(" ").slice(1).join(" ") || "",
        };

        const mockToken: Token = {
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
        };

        // Stockage des informations d'authentification
        localStorage.setItem("token", JSON.stringify(mockToken));
        localStorage.setItem("user", JSON.stringify(mockUser));

        setAuthInfos(mockUser);
        setTokenInfos(mockToken);
        setMessage(null);
        router.replace("/dashboard");

        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        setMessage(
          "Une erreur est survenue lors de la création du compte. Veuillez réessayer."
        );
        console.error("Erreur lors de l'inscription :", error);
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setTokenInfos(null);
    setAuthInfos(null);
    router.replace("/auth/signin");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user: authInfos,
        isLoading,
        login,
        register,
        authInfos,
        setAuthInfos,
        setTokenInfos,
        tokenInfos,
        forgotPassword,
        resetPassword,
        isSubmitted,
        setIsSubmitted,
        isSuccess,
        validateResetToken,
        error,
        setError,
        isValidToken,
        logout,
        message,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
