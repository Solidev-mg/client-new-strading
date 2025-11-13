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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadRate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`📡 Chargement du taux ${toCurrency}...`);
      const data = await ExchangeRateService.getLatestExchangeRate(toCurrency);
      console.log(`✅ Taux ${toCurrency} reçu:`, data);
      setRate(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Erreur lors du chargement du taux de change");
      console.error(`❌ Erreur chargement taux ${toCurrency}:`, err);
    } finally {
      setLoading(false);
    }
  }, [toCurrency]);

  useEffect(() => {
    // Chargement initial
    loadRate();

    // Rafraîchissement automatique toutes les 30 secondes
    const interval = setInterval(() => {
      loadRate();
    }, 30000);

    // Nettoyage de l'intervalle au démontage
    return () => clearInterval(interval);
  }, [loadRate]);

  return {
    rate,
    loading,
    error,
    lastUpdated,
    refresh: loadRate,
  };
};
