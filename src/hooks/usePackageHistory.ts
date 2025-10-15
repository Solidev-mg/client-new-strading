import { PackageHistoryService } from "@/services";
import type { PackageHistory } from "@/services/package-history.service";
import { useCallback, useState } from "react";

export function usePackageHistory() {
  const [history, setHistory] = useState<PackageHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPackageHistory = useCallback(async (packageId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await PackageHistoryService.getPackageHistory(packageId);
      setHistory(result);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de la récupération de l'historique";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getHistoryById = useCallback(async (historyId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await PackageHistoryService.getHistoryById(historyId);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de la récupération de l'historique";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllHistories = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      const result = await PackageHistoryService.getAllHistories(page, limit);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de la récupération des historiques";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    history,
    loading,
    error,
    getPackageHistory,
    getHistoryById,
    getAllHistories,
  };
}
