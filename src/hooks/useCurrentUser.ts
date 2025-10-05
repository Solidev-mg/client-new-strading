"use client";

import { useEffect, useState } from "react";
import { CookieService } from "../services/cookie.service";

interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  clientCode?: string;
  tel?: string;
  clientUserId?: number;
}

/**
 * Hook personnalisé pour récupérer les informations de l'utilisateur connecté
 * Utilise les cookies comme source de vérité
 */
export const useCurrentUser = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = () => {
      try {
        const userData = CookieService.getUserData();
        if (userData) {
          setUser(userData as unknown as UserInfo);
        } else {
          // Fallback vers localStorage si les cookies ne sont pas disponibles
          const localUser = localStorage.getItem("user");
          if (localUser) {
            const parsedUser = JSON.parse(localUser);
            setUser({
              id: parsedUser.id,
              email: parsedUser.email,
              firstName: parsedUser.firstName,
              lastName: parsedUser.lastName,
              clientUserId: parseInt(parsedUser.id), // L'ID utilisateur sert d'ID client
            });
          }
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des données utilisateur:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // ID client facilement accessible
  const clientUserId =
    user?.clientUserId || (user?.id ? parseInt(user.id) : null);

  return {
    user,
    clientUserId: clientUserId as number | null,
    isLoading,
    isAuthenticated: Boolean(user),
  };
};
