"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthService } from "../../../../../services/auth.service";
import { CookieService } from "../../../../../services/cookie.service";
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
  setIsSubmitted: (value: boolean) => void;
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
    const tokenData = CookieService.getTokenData();
    const userData = CookieService.getUserData();
    const currentPath = window.location.pathname;

    if (tokenData && userData) {
      if (currentPath === "/auth/signin") {
        router.replace("/dashboard");
      }
      setTokenInfos(tokenData as unknown as Token);
      setAuthInfos(userData as unknown as User);
    } else {
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
        const response = await AuthService.login({
          email: credentials.email,
          password: credentials.password,
        });

        const user: User = {
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstname,
          lastName: response.user.lastname,
        };

        const token: Token = {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        };

        // Stocker également les informations dans notre nouveau système de cookies
        const extendedUser = {
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstname,
          lastName: response.user.lastname,
          clientCode: response.user.clientCode,
          tel: response.user.tel,
          clientUserId: response.user.id, // L'ID utilisateur sert d'ID client
        };

        // Utiliser les cookies pour la persistance (remplace localStorage)
        CookieService.setTokenData({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
        CookieService.setUserData(extendedUser);

        // Nouveau système avec cookies
        if (typeof window !== "undefined") {
          const { CookieService } = await import(
            "../../../../../services/cookie.service"
          );
          CookieService.setUserData(
            extendedUser as unknown as Record<string, unknown>
          );
          CookieService.setTokenData(
            token as unknown as Record<string, unknown>
          );
        }

        setAuthInfos(user);
        setTokenInfos(token);
        setMessage(null);
        router.replace("/dashboard");
      } catch (error: unknown) {
        console.error("Erreur lors de la connexion :", error);

        const axiosError = error as {
          response?: { status?: number };
          code?: string;
        };
        if (axiosError.response?.status === 401) {
          setMessage("Email ou mot de passe incorrect.");
        } else if (axiosError.response?.status === 400) {
          setMessage("Données de connexion invalides.");
        } else if (
          axiosError.code === "ECONNREFUSED" ||
          axiosError.code === "ERR_NETWORK"
        ) {
          setMessage(
            "Impossible de se connecter au serveur. Veuillez réessayer plus tard."
          );
        } else {
          setMessage("Une erreur inattendue est survenue. Veuillez réessayer.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      console.log("Sending reset email to:", email);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitted(true);
      return true;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    setIsLoading(true);
    try {
      console.log(
        "Resetting password with token:",
        token,
        "and password length:",
        password.length
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSuccess(true);
      setIsSubmitted(true);
      return true;
    } catch (error) {
      setIsSuccess(false);
      setError("Failed to reset password");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (userData: RegisterData) => {
      setIsLoading(true);
      setMessage(null);

      const nameParts = userData.fullName.trim().split(" ");
      const firstname = nameParts[0];
      const lastname = nameParts.slice(1).join(" ") || firstname;

      try {
        const response = await AuthService.register({
          lastname: lastname,
          firstname: firstname,
          tel: userData.phoneNumber,
          deliveryAddress: userData.deliveryAddress,
          email: userData.email,
          password: userData.password,
        });

        const user: User = {
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstname,
          lastName: response.user.lastname,
        };

        const token: Token = {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        };

        // Utiliser les cookies pour la persistance
        CookieService.setTokenData({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
        CookieService.setUserData({
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstname,
          lastName: response.user.lastname,
          clientCode: response.user.clientCode,
          tel: response.user.tel,
          clientUserId: response.user.id,
        });

        setAuthInfos(user);
        setTokenInfos(token);
        setMessage(null);
        router.replace("/dashboard");
      } catch (error: unknown) {
        console.error("Erreur lors de l'inscription :", error);

        const axiosError = error as {
          response?: {
            status?: number;
            data?: { message?: string };
          };
          code?: string;
        };

        if (axiosError.response?.status === 409) {
          setMessage("Un compte avec cet email existe déjà.");
        } else if (axiosError.response?.status === 400) {
          setMessage(
            axiosError.response.data?.message ||
              "Données d'inscription invalides."
          );
        } else if (
          axiosError.code === "ECONNREFUSED" ||
          axiosError.code === "ERR_NETWORK"
        ) {
          setMessage(
            "Impossible de se connecter au serveur. Veuillez réessayer plus tard."
          );
        } else {
          setMessage(
            "Une erreur est survenue lors de la création du compte. Veuillez réessayer."
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error("Erreur lors de la déconnexion côté serveur:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Nettoyer également les cookies
      if (typeof window !== "undefined") {
        const { CookieService } = await import(
          "../../../../../services/cookie.service"
        );
        CookieService.clearAuthData();
      }

      setTokenInfos(null);
      setAuthInfos(null);
      router.replace("/auth/signin");
    }
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
