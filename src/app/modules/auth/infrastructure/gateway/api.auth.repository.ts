import {
  AuthCredentials,
  UserWithToken,
} from "../../domain/entities/auth.entity";
import { AuthRepository } from "../../domain/repositories/auth.repository";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export class SuperTokenAuthRepository implements AuthRepository {
  async login(
    credentials: AuthCredentials
  ): Promise<UserWithToken | { error: string }> {
    try {
      const response = await fetch(`${BASE_URL}club_user_auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Retourne un objet avec le message d'erreur
        return { error: "Email ou mot de passe invalide" };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Gestion des erreurs inattendues
      return {
        error: "Une erreur inattendue est survenue. Veuillez réessayer.",
      };
    }
  }

  async forgotPassword(email: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${BASE_URL}club_user_auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // On lève une erreur avec le message du backend
        throw new Error(
          errorData.message?.[0] || errorData.error || "Erreur inconnue"
        );
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async validateResetToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${BASE_URL}club_user_auth/validate-reset-token/${token}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        // On lève une erreur avec le message du backend
        throw new Error(
          errorData.message?.[0] || errorData.error || "Erreur inconnue"
        );
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async resetPassword(token: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}club_user_auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // On lève une erreur avec le message du backend
        throw new Error(
          errorData.message?.[0] || errorData.error || "Erreur inconnue"
        );
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}
