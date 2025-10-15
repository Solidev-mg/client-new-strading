import {
  UserService,
  type CreateAdminRequest,
  type CreateClientRequest,
  type User,
} from "@/services";
import { useCallback, useState } from "react";

export function useUsers() {
  const [users] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createClient = useCallback(async (userData: CreateClientRequest) => {
    setLoading(true);
    setError(null);

    try {
      const result = await UserService.createClient(userData);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de la création du client";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createAdmin = useCallback(async (userData: CreateAdminRequest) => {
    setLoading(true);
    setError(null);

    try {
      const result = await UserService.createAdmin(userData);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de la création de l'administrateur";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserByEmail = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await UserService.getUserByEmail(email);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de la récupération de l'utilisateur";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await UserService.getUserById(id);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de la récupération de l'utilisateur";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(
    async (id: string, userData: Partial<CreateClientRequest>) => {
      setLoading(true);
      setError(null);

      try {
        const result = await UserService.updateUser(id, userData);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur lors de la mise à jour";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteUser = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await UserService.deleteUser(id);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la suppression";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    loading,
    error,
    createClient,
    createAdmin,
    getUserByEmail,
    getUserById,
    updateUser,
    deleteUser,
  };
}
