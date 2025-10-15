import {
  SmallPackageService,
  type SearchSmallPackageParams,
  type SearchSmallPackageResponse,
} from "@/services";
import { useCallback, useState } from "react";

export function useSmallPackages() {
  const [packages, setPackages] = useState<SearchSmallPackageResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPackages = useCallback(
    async (params: SearchSmallPackageParams) => {
      setLoading(true);
      setError(null);

      try {
        const result = await SmallPackageService.searchSmallPackages(params);
        setPackages(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur lors de la recherche";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getPackageById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await SmallPackageService.getSmallPackageById(id);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la récupération";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPackageByTrackingCode = useCallback(async (trackingCode: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await SmallPackageService.getSmallPackageByTrackingCode(
        trackingCode
      );
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la récupération";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPackage = useCallback(
    async (packageData: {
      userId: number;
      deliveryModeId: string;
      trackingCode: string;
      packageName: string;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const result = await SmallPackageService.createSmallPackage(
          packageData
        );
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur lors de la création";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const renamePackage = useCallback(
    async (packageId: string, newName: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await SmallPackageService.renamePackage(
          packageId,
          newName
        );
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur lors du renommage";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const changeDeliveryMode = useCallback(
    async (packageId: string, newDeliveryModeId: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await SmallPackageService.changeDeliveryMode(
          packageId,
          newDeliveryModeId
        );
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Erreur lors du changement de mode";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    packages,
    loading,
    error,
    searchPackages,
    getPackageById,
    getPackageByTrackingCode,
    createPackage,
    renamePackage,
    changeDeliveryMode,
  };
}
