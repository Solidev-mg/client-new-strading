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
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const currentPath = window.location.pathname;

    if (token && user) {
      if (currentPath === "/auth/signin") {
        router.replace("/dashboard");
      }
      setTokenInfos(JSON.parse(token));
      setAuthInfos(JSON.parse(user));
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

        localStorage.setItem("token", JSON.stringify(token));
        localStorage.setItem("user", JSON.stringify(user));

        setAuthInfos(user);
        setTokenInfos(token);
        setMessage(null);
        router.replace("/dashboard");
      } catch (error: any) {
        console.error("Erreur lors de la connexion :", error);

        if (error.response?.status === 401) {
          setMessage("Email ou mot de passe incorrect.");
        } else if (error.response?.status === 400) {
          setMessage("Données de connexion invalides.");
        } else if (
          error.code === "ECONNREFUSED" ||
          error.code === "ERR_NETWORK"
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

        localStorage.setItem("token", JSON.stringify(token));
        localStorage.setItem("user", JSON.stringify(user));

        setAuthInfos(user);
        setTokenInfos(token);
        setMessage(null);
        router.replace("/dashboard");
      } catch (error: any) {
        console.error("Erreur lors de l'inscription :", error);

        if (error.response?.status === 409) {
          setMessage("Un compte avec cet email existe déjà.");
        } else if (error.response?.status === 400) {
          setMessage(
            error.response.data?.message || "Données d'inscription invalides."
          );
        } else if (
          error.code === "ECONNREFUSED" ||
          error.code === "ERR_NETWORK"
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
