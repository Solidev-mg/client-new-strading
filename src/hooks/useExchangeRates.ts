import {
  ExchangeRate,
  ExchangeRateService,
} from "@/services/exchange-rate.service";
import { useCallback, useEffect, useState } from "react";

export const useExchangeRates = (
  toCurrency?: "USD" | "CNY",
  isActive?: boolean,
  autoLoad: boolean = true
) => {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const loadRates = useCallback(
    async (page: number = 1, limit: number = 10) => {
      try {
        setLoading(true);
        setError(null);
        const response = await ExchangeRateService.getExchangeRates(
          page,
          limit,
          toCurrency,
          isActive
        );
        setRates(response.items);
        setPagination({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        });
      } catch (err) {
        setError("Erreur lors du chargement des taux de change");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [toCurrency, isActive]
  );

  useEffect(() => {
    if (autoLoad) {
      loadRates();
    }
  }, [autoLoad, loadRates]);

  return {
    rates,
    loading,
    error,
    pagination,
    loadRates,
    refresh: () => loadRates(pagination.page, pagination.limit),
  };
};

export const useLatestExchangeRate = (toCurrency: "USD" | "CNY") => {
  const [rate, setRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ExchangeRateService.getLatestExchangeRate(toCurrency);
      setRate(data);
    } catch (err) {
      setError("Erreur lors du chargement du taux de change");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [toCurrency]);

  useEffect(() => {
    loadRate();
  }, [loadRate]);

  return {
    rate,
    loading,
    error,
    refresh: loadRate,
  };
};
