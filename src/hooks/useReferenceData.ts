import { ReferenceDataService } from "@/services";
import type { DeliveryMode, Status } from "@/services/reference-data.service";
import { useCallback, useEffect, useState } from "react";

export function useReferenceData() {
  const [deliveryModes, setDeliveryModes] = useState<DeliveryMode[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDeliveryModes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await ReferenceDataService.getDeliveryModes();
      setDeliveryModes(result);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des modes de livraison";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStatuses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await ReferenceDataService.getStatuses();
      setStatuses(result);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des statuts";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [deliveryModesResult, statusesResult] = await Promise.all([
        ReferenceDataService.getDeliveryModes(),
        ReferenceDataService.getStatuses(),
      ]);

      setDeliveryModes(deliveryModesResult);
      setStatuses(statusesResult);

      return { deliveryModes: deliveryModesResult, statuses: statusesResult };
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des données de référence";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Chargement automatique au montage du composant
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return {
    deliveryModes,
    statuses,
    loading,
    error,
    loadDeliveryModes,
    loadStatuses,
    loadAll,
    refresh: loadAll,
  };
}
