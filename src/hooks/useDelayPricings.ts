import {
  DelayPricing,
  DelayPricingService,
} from "@/services/delay-pricing.service";
import { useCallback, useEffect, useState } from "react";

export const useDelayPricings = (
  isActive?: boolean,
  autoLoad: boolean = true
) => {
  const [pricings, setPricings] = useState<DelayPricing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const loadPricings = useCallback(
    async (page: number = 1, limit: number = 10) => {
      try {
        setLoading(true);
        setError(null);
        const response = await DelayPricingService.getDelayPricings(
          page,
          limit,
          isActive
        );
        setPricings(response.items);
        setPagination({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        });
      } catch (err) {
        setError("Erreur lors du chargement des tarifications de délai");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [isActive]
  );

  useEffect(() => {
    if (autoLoad) {
      loadPricings();
    }
  }, [autoLoad, loadPricings]);

  return {
    pricings,
    loading,
    error,
    pagination,
    loadPricings,
    refresh: () => loadPricings(pagination.page, pagination.limit),
  };
};

export const useDelayPricing = (pricingId?: number) => {
  const [pricing, setPricing] = useState<DelayPricing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPricing = useCallback(async () => {
    if (!pricingId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await DelayPricingService.getDelayPricingById(pricingId);
      setPricing(data);
    } catch (err) {
      setError("Erreur lors du chargement de la tarification de délai");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pricingId]);

  useEffect(() => {
    loadPricing();
  }, [loadPricing]);

  return {
    pricing,
    loading,
    error,
    refresh: loadPricing,
  };
};
