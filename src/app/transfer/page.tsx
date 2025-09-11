"use client";

import {
  Currency,
  Transfer,
  TransferPaymentMethod,
  TransferStatus,
} from "@/app/modules/transfer/domain/entities/transfer.entity";
import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

export default function TransferPage() {
  const [activeTab, setActiveTab] = useState<"create" | "history">("create");
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);

  // États pour la création de transfert
  const [fromCurrency, setFromCurrency] = useState<Currency>(Currency.MGA);
  const [toCurrency, setToCurrency] = useState<Currency>(Currency.USD);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");

  // Taux de change simulés
  const exchangeRates = useMemo(
    () => ({
      MGA_USD: 0.00022,
      USD_MGA: 4545.45,
      MGA_RMB: 0.0015,
      RMB_MGA: 666.67,
      USD_RMB: 7.2,
      RMB_USD: 0.139,
    }),
    []
  );

  // Historique des transferts mock
  const mockTransfers: Transfer[] = useMemo(
    () => [
      {
        id: "1",
        userId: "user1",
        fromCurrency: Currency.MGA,
        toCurrency: Currency.USD,
        fromAmount: 2272725,
        toAmount: 500,
        exchangeRate: 0.00022,
        fees: 10,
        totalAmount: 2272735,
        paymentMethod: TransferPaymentMethod.MOBILE_MONEY,
        recipientInfo: { type: "QR_CODE", qrCode: "sample-qr" },
        status: TransferStatus.COMPLETED,
        createdAt: new Date("2024-03-15T14:30:00"),
        updatedAt: new Date("2024-03-15T14:32:00"),
        completedAt: new Date("2024-03-15T14:32:00"),
        chatMessages: [],
      },
      {
        id: "2",
        userId: "user1",
        fromCurrency: Currency.USD,
        toCurrency: Currency.RMB,
        fromAmount: 300,
        toAmount: 2160,
        exchangeRate: 7.2,
        fees: 5,
        totalAmount: 305,
        paymentMethod: TransferPaymentMethod.BANK_TRANSFER,
        recipientInfo: {
          type: "BANK_ACCOUNT",
          bankDetails: {
            accountNumber: "1234567890",
            accountName: "Test Account",
            bankName: "Test Bank",
          },
        },
        status: TransferStatus.PENDING,
        createdAt: new Date("2024-03-14T10:15:00"),
        updatedAt: new Date("2024-03-14T10:15:00"),
        chatMessages: [],
      },
    ],
    []
  );

  // Calcul du montant converti
  const calculateConvertedAmount = useCallback(
    (amount: string, from: Currency, to: Currency): string => {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount)) return "";

      const rateKey = `${from}_${to}` as keyof typeof exchangeRates;
      const rate = exchangeRates[rateKey];
      if (!rate) return "";

      return (numAmount * rate).toFixed(2);
    },
    [exchangeRates]
  );

  // Gestion du changement de montant source
  useEffect(() => {
    if (fromAmount) {
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

  // Charger l'historique des transferts
  useEffect(() => {
    if (activeTab === "history") {
      setLoading(true);
      setTimeout(() => {
        setTransfers(mockTransfers);
        setLoading(false);
      }, 1000);
    }
  }, [activeTab, mockTransfers]);

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

  const formatCurrency = (amount: number, currency: Currency) => {
    const symbols = {
      [Currency.MGA]: "Ar",
      [Currency.USD]: "$",
      [Currency.RMB]: "¥",
    };
    return `${amount.toLocaleString()} ${symbols[currency]}`;
  };

  const handleCurrencySwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
  };

  const handleTransferSubmit = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      alert("Veuillez entrer un montant valide");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert("Transfert créé avec succès!");
      setFromAmount("");
      setToAmount("");
      setActiveTab("history");
    } catch {
      alert("Erreur lors de la création du transfert");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Transfert de Devises"
      description="Effectuez des transferts RMB/USD facilement"
    >
      {/* Onglets */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("create")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "create"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Nouveau Transfert
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Historique
            </button>
          </nav>
        </div>
      </div>

      {activeTab === "create" ? (
        <div className="space-y-8">
          {/* Calculateur de change */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Calculateur de Change
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Devise source */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  De
                </label>
                <div className="flex space-x-4">
                  <select
                    value={fromCurrency}
                    onChange={(e) =>
                      setFromCurrency(e.target.value as Currency)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={Currency.MGA}>Ariary (MGA)</option>
                    <option value={Currency.USD}>Dollar US (USD)</option>
                    <option value={Currency.RMB}>Yuan chinois (RMB)</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Montant"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Bouton d'échange */}
              <div className="flex items-center justify-center lg:justify-start">
                <button
                  onClick={handleCurrencySwap}
                  className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"
                  title="Échanger les devises"
                >
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
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </button>
              </div>

              {/* Devise cible */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Vers
                </label>
                <div className="flex space-x-4">
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value as Currency)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={Currency.MGA}>Ariary (MGA)</option>
                    <option value={Currency.USD}>Dollar US (USD)</option>
                    <option value={Currency.RMB}>Yuan chinois (RMB)</option>
                  </select>
                  <input
                    type="text"
                    value={toAmount}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    placeholder="Montant converti"
                  />
                </div>
              </div>
            </div>

            {/* Taux de change actuel */}
            {fromAmount && toAmount && (
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                  1 {fromCurrency} ={" "}
                  {exchangeRates[
                    `${fromCurrency}_${toCurrency}` as keyof typeof exchangeRates
                  ]?.toFixed(6)}{" "}
                  {toCurrency}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Vous recevrez environ{" "}
                  <span className="font-semibold">
                    {formatCurrency(parseFloat(toAmount), toCurrency)}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Bouton de soumission */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <button
              onClick={handleTransferSubmit}
              disabled={!fromAmount || parseFloat(fromAmount) <= 0 || loading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Traitement en cours..." : "Effectuer le transfert"}
            </button>
          </div>
        </div>
      ) : (
        /* Historique des transferts */
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Historique des Transferts
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">
                Chargement de l&apos;historique...
              </p>
            </div>
          ) : transfers.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">💸</div>
              <p className="text-gray-500">Aucun transfert trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Transfert
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Direction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transfers.map((transfer) => (
                    <tr key={transfer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {transfer.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900">
                            {transfer.fromCurrency} → {transfer.toCurrency}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(
                            transfer.fromAmount,
                            transfer.fromCurrency
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          ≈{" "}
                          {formatCurrency(
                            transfer.toAmount,
                            transfer.toCurrency
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            transfer.status
                          )}`}
                        >
                          {getStatusText(transfer.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transfer.createdAt).toLocaleDateString(
                          "fr-FR"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
