"use client";

import { User } from "@/modules/user/domain/entities/user.entity";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthCredentials, Token } from "../../domain/entities/auth.entity";
import {
  ForgotPasswordUsecase,
  LoginUsecase,
  ResetPasswordUsecase,
  ValidateResetTokenUsecase,
} from "../../domain/usecases/auth.usecase";
import { SuperTokenAuthRepository } from "../../infrastructure/gateway/api.auth.repository";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
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
  const pathname = usePathname();

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
        currentPath !== "/auth/signin"
      ) {
        router.replace("/auth/signin");
      }
    }
  }, [router]);

  const validateResetToken = useCallback(async (token: string) => {
    try {
      const response = await new ValidateResetTokenUsecase(
        new SuperTokenAuthRepository()
      ).execute(token);
      setIsValidToken(response);
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  const login = useCallback(async (credentials: AuthCredentials) => {
    setIsLoading(true);
    try {
      const loginResponse = await new LoginUsecase(
        new SuperTokenAuthRepository()
      ).execute(credentials.email, credentials.password);

      console.log("loginResponse", loginResponse);

      if ("error" in loginResponse) {
        // Gestion explicite des erreurs
        setMessage(
          loginResponse.error ||
            "Authentification, Email ou mot de passe invalide"
        );
        setIsLoading(false);
        return;
      }

      // Stockage des informations d'authentification
      localStorage.setItem(
        "token",
        JSON.stringify(loginResponse.authInfos?.token)
      );
      localStorage.setItem(
        "user",
        JSON.stringify(loginResponse.authInfos?.user)
      );

      setAuthInfos(loginResponse.authInfos?.user as User);
      setTokenInfos(loginResponse.authInfos?.token as Token);
      setMessage(null);
      router.replace("/dashboard");
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setMessage("Une erreur inattendue est survenue. Veuillez réessayer.");
      console.error("Erreur lors de la connexion :", error);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      const forgotPasswordResponse = await new ForgotPasswordUsecase(
        new SuperTokenAuthRepository()
      ).execute(email);
      setIsLoading(false);
      setIsSubmitted(true);
      return forgotPasswordResponse;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    setIsLoading(true);
    try {
      const resetPasswordResponse = await new ResetPasswordUsecase(
        new SuperTokenAuthRepository()
      ).execute(token, password);
      setIsLoading(false);
      setIsSuccess(true);
      setIsSubmitted(true);
      return resetPasswordResponse;
    } catch (error) {
      setIsLoading(false);
      setIsSuccess(false);
      setError("Failed to reset password");
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setTokenInfos(null);
    setAuthInfos(null);
    router.replace("/auth/signin");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: null,
        isLoading,
        login,
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
