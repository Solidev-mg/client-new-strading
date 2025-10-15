"use client";

/**
 * Service pour la gestion sécurisée des cookies
 */
export class CookieService {
  /**
   * Définit un cookie avec des options de sécurité
   */
  static setCookie(name: string, value: string, days: number = 7): void {
    if (typeof window === "undefined") return;

    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;

    // Options de sécurité pour les cookies
    const options = [
      `${name}=${encodeURIComponent(value)}`,
      expires,
      "path=/",
      "SameSite=Strict",
      // 'Secure', // Décommentez en production avec HTTPS
    ].join("; ");

    document.cookie = options;
  }

  /**
   * Récupère la valeur d'un cookie
   */
  static getCookie(name: string): string | null {
    if (typeof window === "undefined") return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(";").shift();
      return cookieValue ? decodeURIComponent(cookieValue) : null;
    }

    return null;
  }

  /**
   * Supprime un cookie
   */
  static deleteCookie(name: string): void {
    if (typeof window === "undefined") return;

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  /**
   * Stocke les informations utilisateur dans un cookie sécurisé
   */
  static setUserData(userData: Record<string, unknown>): void {
    this.setCookie("user_data", JSON.stringify(userData), 7);
  }

  /**
   * Récupère les informations utilisateur depuis le cookie
   */
  static getUserData(): Record<string, unknown> | null {
    const userData = this.getCookie("user_data");
    try {
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Erreur lors du parsing des données utilisateur:", error);
      return null;
    }
  }

  /**
   * Stocke les tokens dans un cookie sécurisé
   */
  static setTokenData(tokenData: Record<string, unknown>): void {
    console.log("Stockage des tokens dans les cookies:", tokenData);
    this.setCookie("auth_tokens", JSON.stringify(tokenData), 7);
  }

  /**
   * Récupère les tokens depuis le cookie
   */
  static getTokenData(): Record<string, unknown> | null {
    const tokenData = this.getCookie("auth_tokens");
    console.log("Récupération des tokens depuis les cookies:", tokenData);
    try {
      return tokenData ? JSON.parse(tokenData) : null;
    } catch (error) {
      console.error("Erreur lors du parsing des tokens:", error);
      return null;
    }
  }

  /**
   * Supprime toutes les données d'authentification
   */
  static clearAuthData(): void {
    this.deleteCookie("user_data");
    this.deleteCookie("auth_tokens");
  }
}
