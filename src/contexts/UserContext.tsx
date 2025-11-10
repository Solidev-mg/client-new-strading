"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { CookieService } from "../services/cookie.service";

// Interface pour les informations utilisateur étendues
export interface AuthenticatedUser {
  id: number; // Changé de string à number pour correspondre au backend
  email: string;
  firstName: string;
  lastName: string;
  clientCode?: string;
  tel?: string;
  clientUserId?: number; // ID client pour les colis
  role?: "CLIENT" | "ADMIN" | "SUPER_ADMIN";
}

// Interface pour les tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Interface du contexte
interface UserContextType {
  user: AuthenticatedUser | null;
  tokens: AuthTokens | null;
  setUser: (user: AuthenticatedUser | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  clientUserId: number | null; // ID client facilement accessible
  isAdmin: boolean; // Helper pour vérifier si l'utilisateur est admin
}

// Créer le contexte
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider du contexte utilisateur
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<AuthenticatedUser | null>(null);
  const [tokens, setTokensState] = useState<AuthTokens | null>(null);

  // Charger les données depuis les cookies au démarrage
  useEffect(() => {
    const savedUser = CookieService.getUserData();
    const savedTokens = CookieService.getTokenData();

    if (savedUser && typeof savedUser === "object") {
      setUserState(savedUser as unknown as AuthenticatedUser);
    }

    if (savedTokens && typeof savedTokens === "object") {
      setTokensState(savedTokens as unknown as AuthTokens);
    }
  }, []);

  // Fonction pour définir l'utilisateur
  const setUser = (newUser: AuthenticatedUser | null) => {
    if (newUser) {
      console.log("👤 Setting user in context:", {
        id: newUser.id,
        idType: typeof newUser.id,
        email: newUser.email,
        role: newUser.role,
        clientUserId: newUser.clientUserId,
      });
    }
    setUserState(newUser);
    if (newUser) {
      CookieService.setUserData(newUser as unknown as Record<string, unknown>);
    } else {
      CookieService.clearAuthData();
    }
  };

  // Fonction pour définir les tokens
  const setTokens = (newTokens: AuthTokens | null) => {
    setTokensState(newTokens);
    if (newTokens) {
      CookieService.setTokenData(
        newTokens as unknown as Record<string, unknown>
      );
    } else {
      CookieService.clearAuthData();
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    setUserState(null);
    setTokensState(null);
    CookieService.clearAuthData();
  };

  // Déterminer si l'utilisateur est authentifié
  const isAuthenticated = Boolean(user && tokens);

  // Extraire l'ID client facilement accessible
  const clientUserId = user?.clientUserId || user?.id || null;

  // Helper pour vérifier si l'utilisateur est admin
  const isAdmin = Boolean(
    user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
  );

  return (
    <UserContext.Provider
      value={{
        user,
        tokens,
        setUser,
        setTokens,
        logout,
        isAuthenticated,
        clientUserId,
        isAdmin,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Hook pour utiliser le contexte utilisateur
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
