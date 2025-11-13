"use client";

import { transferRepository } from "@/app/modules/transfer";
import {
  Currency,
  FromCurrency,
  ToCurrency,
  TransferPaymentMethod,
  TransferStatus,
} from "@/app/modules/transfer/domain/entities/transfer.entity";
import {
  useExchangeRates,
  useLatestExchangeRate,
} from "@/hooks/useExchangeRates";
import { useTransferManagement } from "@/hooks/useTransferManagement";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import ExchangeRateChart from "../components/ExchangeRateChart";
import TransferNotification from "../components/TransferNotification";
import TransferStats from "../components/TransferStats";

type NotificationType = {
  type: "success" | "error" | "info" | "warning";
  message: string;
  description?: string;
} | null;

export default function TransferPage() {
  const [activeTab, setActiveTab] = useState<"create" | "history">("create");
  const [showRateHistory, setShowRateHistory] = useState(false);
  const [notification, setNotification] = useState<NotificationType>(null);

  // États pour la création de transfert
  const [fromCurrency, setFromCurrency] = useState<FromCurrency>(
    FromCurrency.MGA
  );
  const [toCurrency, setToCurrency] = useState<ToCurrency>(ToCurrency.USD);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");

  // Utilisation du hook de gestion des transferts
  const {
    transfers,
    loading,
    loadingMore,
    hasMore,
    refresh: refreshTransfers,
    loadMore,
  } = useTransferManagement();

  // Ref pour l'élément sentinel du lazy loading
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Restriction: Seules les conversions MGA → USD et MGA → CNY sont autorisées
  const isValidConversion =
    fromCurrency === FromCurrency.MGA &&
    (toCurrency === ToCurrency.USD || toCurrency === ToCurrency.CNY);

  // Hooks pour les taux de change réels
  const {
    rate: usdRate,
    loading: usdLoading,
    lastUpdated: usdLastUpdated,
    refresh: refreshUsdRate,
  } = useLatestExchangeRate("USD");
  const {
    rate: cnyRate,
    loading: cnyLoading,
    lastUpdated: cnyLastUpdated,
    refresh: refreshCnyRate,
  } = useLatestExchangeRate("CNY");
  const { rates: ratesHistory, loading: historyLoading } = useExchangeRates(
    toCurrency === ToCurrency.USD ? "USD" : "CNY",
    true,
    showRateHistory
  );

  // Fonction pour rafraîchir tous les taux de change
  const refreshExchangeRates = useCallback(() => {
    refreshUsdRate();
    refreshCnyRate();
  }, [refreshUsdRate, refreshCnyRate]);

  // Formater le timestamp de dernière mise à jour
  const formatLastUpdated = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Taux de change dynamiques basés sur l'API
  // Les taux de la DB sont stockés comme: from_currency -> to_currency = rate
  // Ex: MGA -> USD = 0.000220 (signifie 1 MGA = 0.000220 USD)
  const exchangeRates = useMemo(() => {
    // Debug: afficher les valeurs reçues de l'API
    console.log("🔍 DEBUG - usdRate:", usdRate);
    console.log("🔍 DEBUG - cnyRate:", cnyRate);

    // Taux MGA -> USD (depuis la DB) avec vérification de type
    const mgaToUsdRate =
      usdRate && typeof usdRate.rate === "number" ? Number(usdRate.rate) : null;
    // Taux MGA -> CNY (depuis la DB) avec vérification de type
    const mgaToCnyRate =
      cnyRate && typeof cnyRate.rate === "number" ? Number(cnyRate.rate) : null;

    console.log("💰 Taux calculés - USD:", mgaToUsdRate, "CNY:", mgaToCnyRate);

    // Calcul des taux inverses et croisés (gérer les null)
    return {
      MGA_USD: mgaToUsdRate, // 1 MGA = X USD (ou null si désactivé)
      USD_MGA: mgaToUsdRate ? 1 / mgaToUsdRate : null, // 1 USD = X MGA
      MGA_CNY: mgaToCnyRate, // 1 MGA = X CNY (ou null si désactivé)
      CNY_MGA: mgaToCnyRate ? 1 / mgaToCnyRate : null, // 1 CNY = X MGA
      USD_CNY:
        mgaToUsdRate && mgaToCnyRate ? mgaToUsdRate / mgaToCnyRate : null,
      CNY_USD:
        mgaToCnyRate && mgaToUsdRate ? mgaToCnyRate / mgaToUsdRate : null,
    };
  }, [usdRate, cnyRate]);

  // Calcul du montant converti
  const calculateConvertedAmount = useCallback(
    (amount: string, from: string, to: string): string => {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount)) return "";

      const rateKey = `${from}_${to}` as keyof typeof exchangeRates;
      const rate = exchangeRates[rateKey];
      if (!rate) return "";

      return (numAmount * rate).toFixed(2);
    },
    [exchangeRates]
  );

  // Calcul automatique du montant converti quand les paramètres changent
  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0) {
      const converted = calculateConvertedAmount(
        fromAmount,
        fromCurrency,
        toCurrency
      );
      setToAmount(converted);
    } else {
      setToAmount("");
    }
  }, [fromAmount, fromCurrency, toCurrency, calculateConvertedAmount]);

  // Configuration de l'Intersection Observer pour le lazy loading
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadingMore, loadMore]);

  // Charger l'historique des transferts - maintenant géré par le hook useTransferManagement
  // Le hook s'occupe automatiquement du chargement initial

  const getStatusColor = (status: TransferStatus) => {
    switch (status) {
      case TransferStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case TransferStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      case TransferStatus.FAILED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: TransferStatus) => {
    switch (status) {
      case TransferStatus.PENDING:
        return "En attente";
      case TransferStatus.COMPLETED:
        return "Complété";
      case TransferStatus.FAILED:
        return "Échoué";
      default:
        return status;
    }
  };

  const formatCurrency = (
    amount: number,
    currency: FromCurrency | ToCurrency | Currency
  ) => {
    const symbols: Record<string, string> = {
      [Currency.MGA]: "Ar",
      [Currency.USD]: "$",
      [Currency.CNY]: "¥",
    };
    return `${amount.toLocaleString()} ${symbols[currency as string]}`;
  };

  const handleTransferSubmit = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setNotification({
        type: "error",
        message: "Montant invalide",
        description: "Veuillez entrer un montant valide pour continuer",
      });
      return;
    }

    // Vérification que seules les conversions MGA → USD ou MGA → CNY sont autorisées
    if (!isValidConversion) {
      setNotification({
        type: "error",
        message: "Conversion non autorisée",
        description:
          "Seules les conversions de MGA vers USD ou CNY sont autorisées",
      });
      return;
    }

    // Vérifier que le taux de change est disponible (actif)
    const selectedRate = toCurrency === ToCurrency.USD ? usdRate : cnyRate;
    if (!selectedRate || typeof selectedRate.rate !== "number") {
      setNotification({
        type: "error",
        message: "Taux de change non disponible",
        description: `Le taux de change pour ${toCurrency} est actuellement désactivé. Veuillez contacter l'administration ou choisir une autre devise.`,
      });
      return;
    }

    // Le loading est maintenant géré par le hook useTransferManagement
    try {
      // Préparer les données du transfert
      const transferData = {
        fromCurrency: FromCurrency.MGA,
        toCurrency,
        fromAmount: parseFloat(fromAmount),
        toAmount: parseFloat(toAmount),
        recipientType: "QR_CODE" as const,
        qrCodeData: "sample-qr-code-data", // TODO: obtenir le vrai QR code
        mobileMoneyProvider: "Orange", // TODO: permettre à l'utilisateur de choisir
        mobileMoneyNumber: "0340000000", // TODO: obtenir le numéro depuis un formulaire
        notes: `Transfert de ${formatCurrency(
          parseFloat(fromAmount),
          fromCurrency
        )} vers ${formatCurrency(parseFloat(toAmount), toCurrency)}`,
      };

      console.log(
        "Envoi de la requête de création de transfert:",
        transferData
      );

      // Appel API réel pour créer le transfert
      const newTransfer = await transferRepository.createTransfer(transferData);

      console.log("Transfert créé avec succès:", newTransfer);

      setNotification({
        type: "success",
        message: "Transfert créé avec succès!",
        description: `${formatCurrency(
          parseFloat(fromAmount),
          fromCurrency
        )} converti en ${formatCurrency(
          parseFloat(toAmount),
          toCurrency
        )}. Référence: ${newTransfer.id}`,
      });

      setFromAmount("");
      setToAmount("");

      // Ajouter le nouveau transfert à l'historique - le hook s'en charge automatiquement
      // via refreshTransfers() appelé dans le hook useTransferManagement

      setTimeout(() => {
        setActiveTab("history");
      }, 1500);
    } catch (error: unknown) {
      console.error("Erreur lors de la création du transfert:", error);

      // Extraire plus de détails de l'erreur
      let errorMessage = "Une erreur est survenue. Veuillez réessayer.";
      if (error && typeof error === "object") {
        if ("response" in error) {
          const axiosError = error as {
            response?: { data?: { message?: string }; status?: number };
          };
          console.error("Détails de l'erreur HTTP:", {
            status: axiosError.response?.status,
            data: axiosError.response?.data,
          });

          if (axiosError.response?.status === 401) {
            errorMessage =
              "Vous devez être connecté pour effectuer un transfert. Veuillez vous reconnecter.";
          } else if (axiosError.response?.data?.message) {
            errorMessage = axiosError.response.data.message;
          }
        } else if ("message" in error) {
          errorMessage = (error as Error).message;
        }
      }

      setNotification({
        type: "error",
        message: "Erreur lors de la création",
        description: errorMessage,
      });
    } finally {
      // Le loading est maintenant géré par le hook useTransferManagement
    }
  };

  return (
    <DashboardLayout
      title="Transfert de Devises"
      description="Effectuez des transferts RMB/USD facilement"
    >
      {/* Notifications */}
      {notification && (
        <TransferNotification
          type={notification.type}
          message={notification.message}
          description={notification.description}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Indicateur de chargement des taux */}
      {(usdLoading || cnyLoading) && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-sm text-blue-700">
            Mise à jour des taux de change en temps réel...
          </span>
        </div>
      )}

      {/* Onglets avec animation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("create")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === "create"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Nouveau Transfert
              </span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === "history"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Historique
              </span>
            </button>
          </nav>
        </div>
      </div>

      {activeTab === "create" ? (
        <div className="space-y-8">
          {/* En-tête avec bouton de rafraîchissement */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Taux de change en temps réel
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {usdLastUpdated || cnyLastUpdated ? (
                  <>
                    Dernière mise à jour :{" "}
                    {formatLastUpdated(usdLastUpdated || cnyLastUpdated)} •
                    Rafraîchissement auto toutes les 30s
                  </>
                ) : (
                  "Chargement des taux..."
                )}
              </p>
            </div>
            <button
              onClick={refreshExchangeRates}
              disabled={usdLoading || cnyLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className={`w-5 h-5 ${
                  usdLoading || cnyLoading ? "animate-spin" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Actualiser
            </button>
          </div>

          {/* Carte des taux de change en temps réel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Widget USD */}
            {usdRate && typeof usdRate.rate === "number" ? (
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-90 font-semibold">
                    MGA → USD
                  </span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {Number(usdRate.rate).toFixed(6)}
                </div>
                <div className="text-sm opacity-90">
                  1 MGA = {Number(usdRate.rate).toFixed(6)} USD
                </div>
                <div className="text-xs opacity-75 mt-2">
                  1 USD ={" "}
                  {(1 / Number(usdRate.rate)).toLocaleString("fr-FR", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  Ar
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg shadow-lg p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm opacity-90 font-semibold">
                      MGA → USD
                    </span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold mb-2">
                    Taux non disponible
                  </div>
                  <div className="text-sm opacity-90">
                    Le taux USD est actuellement désactivé. Veuillez contacter
                    l&apos;administration.
                  </div>
                </div>
              </div>
            )}

            {/* Widget CNY */}
            {cnyRate && typeof cnyRate.rate === "number" ? (
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-90 font-semibold">
                    MGA → CNY
                  </span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {Number(cnyRate.rate).toFixed(6)}
                </div>
                <div className="text-sm opacity-90">
                  1 MGA = {Number(cnyRate.rate).toFixed(6)} CNY
                </div>
                <div className="text-xs opacity-75 mt-2">
                  1 CNY ={" "}
                  {(1 / Number(cnyRate.rate)).toLocaleString("fr-FR", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  Ar
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg shadow-lg p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm opacity-90 font-semibold">
                      MGA → CNY
                    </span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold mb-2">
                    Taux non disponible
                  </div>
                  <div className="text-sm opacity-90">
                    Le taux CNY est actuellement désactivé. Veuillez contacter
                    l&apos;administration.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bouton pour afficher l'historique des taux */}
          {/* <div className="flex justify-end">
            <button
              onClick={() => setShowRateHistory(!showRateHistory)}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span>
                {showRateHistory ? "Masquer" : "Voir"} l&apos;historique des
                taux
              </span>
            </button>
          </div> */}

          {/* Historique des taux de change avec graphique */}
          {showRateHistory && (
            <div className="bg-white rounded-lg shadow-sm border p-6 animate-fadeIn">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Évolution des taux
              </h3>
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : ratesHistory && ratesHistory.length > 0 ? (
                <div className="space-y-6">
                  {/* Graphique */}
                  <ExchangeRateChart
                    rates={ratesHistory}
                    currency={toCurrency === ToCurrency.USD ? "USD" : "CNY"}
                  />

                  {/* Table des taux */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Devise
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Taux
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Statut
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {ratesHistory.slice(0, 5).map((rate, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {new Date(rate.createdAt).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {rate.toCurrency}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {rate.rate.toLocaleString()} Ar
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  rate.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {rate.isActive ? "Actif" : "Inactif"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Aucun historique disponible
                </p>
              )}
            </div>
          )}

          {/* Calculateur de change amélioré */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Calculateur de Change
              </h2>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Taux en temps réel</span>
              </div>
            </div>

            {/* Alerte si taux désactivé */}
            {(!usdRate || !cnyRate) && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-yellow-600 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">
                    Certains taux de change sont désactivés
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {!usdRate && "USD "}
                    {!usdRate && !cnyRate && "et "}
                    {!cnyRate && "CNY "}
                    {!usdRate && !cnyRate
                      ? "sont actuellement indisponibles"
                      : "est actuellement indisponible"}
                    . Les transferts vers {!usdRate && "USD"}
                    {!usdRate && !cnyRate && " et "}
                    {!cnyRate && "CNY"} sont temporairement suspendus.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              {/* Devise source */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Vous envoyez
                </label>
                <div className="relative">
                  <div className="flex space-x-3">
                    <select
                      value={fromCurrency}
                      onChange={(e) => {
                        const newValue = e.target.value as FromCurrency;
                        setFromCurrency(newValue);
                      }}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 text-gray-900 font-semibold"
                      disabled
                    >
                      <option
                        value={FromCurrency.MGA}
                        className="text-gray-900 font-semibold"
                      >
                        Ariary (MGA)
                      </option>
                    </select>
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={fromAmount}
                        onChange={(e) => setFromAmount(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm text-lg font-semibold transition-all duration-200 text-black"
                      />
                      {fromAmount && (
                        <button
                          onClick={() => setFromAmount("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Devise cible */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Vous recevez
                </label>
                <div className="flex space-x-3">
                  <select
                    value={toCurrency}
                    onChange={(e) => {
                      const newValue = e.target.value as ToCurrency;
                      setToCurrency(newValue);
                    }}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 text-gray-900 font-semibold"
                  >
                    <option
                      value={ToCurrency.USD}
                      className="text-gray-900 font-semibold"
                    >
                      Dollar US (USD)
                    </option>
                    <option
                      value={ToCurrency.CNY}
                      className="text-gray-900 font-semibold"
                    >
                      Yuan (CNY)
                    </option>
                  </select>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={toAmount}
                      readOnly
                      className="w-full px-4 py-3 border-2 border-green-300 bg-green-50 rounded-lg text-lg font-bold text-green-700"
                      placeholder="0.00"
                    />
                    {toAmount && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Informations détaillées sur le taux */}
            {fromAmount && toAmount && (
              <div className="mt-6 space-y-3">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      Taux de change
                    </span>
                    <span className="text-sm font-bold text-blue-700">
                      1 {fromCurrency} ={" "}
                      {exchangeRates[
                        `${fromCurrency}_${toCurrency}` as keyof typeof exchangeRates
                      ]?.toFixed(6)}{" "}
                      {toCurrency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Montant final</span>
                    <span className="text-lg font-bold text-blue-900">
                      {formatCurrency(parseFloat(toAmount), toCurrency)}
                    </span>
                  </div>
                </div>

                {/* Frais estimés */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">
                      Frais estimés
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      0.5%
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">
                      Temps de traitement
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      ~2 min
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bouton de soumission amélioré */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <button
              onClick={handleTransferSubmit}
              disabled={!fromAmount || parseFloat(fromAmount) <= 0 || loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Traitement en cours...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Effectuer le transfert maintenant
                </span>
              )}
            </button>

            {/* Note de sécurité */}
            <div className="mt-4 flex items-start space-x-2 text-xs text-gray-500">
              <svg
                className="w-4 h-4 text-green-500 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>
                Vos transactions sont sécurisées et cryptées de bout en bout
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Historique des transferts amélioré */
        <div className="space-y-6">
          {/* Statistiques */}
          <TransferStats
            totalTransfers={transfers.length}
            completedTransfers={
              transfers.filter((t) => t.status === TransferStatus.COMPLETED)
                .length
            }
            pendingTransfers={
              transfers.filter((t) => t.status === TransferStatus.PENDING)
                .length
            }
            totalVolume={transfers.reduce((sum, t) => sum + t.fromAmount, 0)}
          />

          {/* Table de l'historique avec lazy loading */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg
                    className="w-6 h-6 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Historique des Transferts
                </h2>
                <button
                  onClick={() => refreshTransfers()}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Actualiser</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">
                  Chargement de l&apos;historique...
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Récupération de vos dernières transactions
                </p>
              </div>
            ) : transfers.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mb-4">
                  <svg
                    className="w-20 h-20 mx-auto text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium text-lg mb-2">
                  Aucun transfert trouvé
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  Commencez par créer votre premier transfert de devises
                </p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:scale-105 duration-200"
                >
                  Créer un transfert
                </button>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <div className="divide-y divide-gray-200">
                  {transfers.map((transfer) => (
                    <div
                      key={transfer.id}
                      className="p-4 hover:bg-blue-50 transition-colors duration-150"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              #{transfer.id}
                            </div>
                            <div className="text-xs text-gray-500">
                              {transfer.paymentMethod ===
                              TransferPaymentMethod.MOBILE_MONEY
                                ? "Mobile Money"
                                : "Virement bancaire"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                {transfer.fromCurrency}
                              </span>
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                              </svg>
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                {transfer.toCurrency}
                              </span>
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                              {formatCurrency(
                                transfer.fromAmount,
                                transfer.fromCurrency
                              )}
                            </div>
                            <div className="text-xs text-green-600 font-medium">
                              →{" "}
                              {formatCurrency(
                                transfer.toAmount,
                                transfer.toCurrency
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="mb-1">
                              <span
                                className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                  transfer.status
                                )}`}
                              >
                                {transfer.status ===
                                  TransferStatus.COMPLETED && (
                                  <svg
                                    className="w-3 h-3 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                                {transfer.status === TransferStatus.PENDING && (
                                  <svg
                                    className="w-3 h-3 mr-1 animate-spin"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                  </svg>
                                )}
                                {getStatusText(transfer.status)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(transfer.createdAt).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(transfer.createdAt).toLocaleTimeString(
                                "fr-FR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Loader pour le lazy loading */}
                  {loadingMore && (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">
                        Chargement de plus de transferts...
                      </p>
                    </div>
                  )}

                  {/* Sentinel pour déclencher le lazy loading */}
                  {hasMore && !loadingMore && (
                    <div ref={sentinelRef} className="h-4" />
                  )}
                </div>
              </div>
            )}

            {/* Statistiques en bas */}
            {!loading && transfers.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div>
                    Affichage de{" "}
                    <span className="font-semibold">{transfers.length}</span>{" "}
                    transfert(s)
                  </div>
                  {!hasMore && transfers.length > 0 && (
                    <div className="text-green-600 font-medium">
                      Tous les transferts chargés
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
