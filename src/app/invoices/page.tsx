"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useDelayPricings } from "@/hooks/useDelayPricings";
import { Invoice, InvoiceService } from "@/services/invoice.service";
import { PaymentService } from "@/services/payment.service";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  FileText,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

type InvoiceStatus = "EN_ATTENTE" | "PAYEE" | "ANNULEE" | "ALL";

interface PaymentModalData {
  invoice: Invoice;
  isOpen: boolean;
}

export default function InvoicesPage() {
  const { clientUserId } = useCurrentUser();
  const { pricings } = useDelayPricings(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [downloadingPdf, setDownloadingPdf] = useState<number | null>(null);
  const [paymentModal, setPaymentModal] = useState<PaymentModalData>({
    invoice: {} as Invoice,
    isOpen: false,
  });
  const [selectedDelayPricingId, setSelectedDelayPricingId] = useState<
    number | null
  >(null);
  const [delayDays, setDelayDays] = useState<number>(0);
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const limit = 10;

  console.log("InvoicesPage - clientUserId:", clientUserId);
  console.log("InvoicesPage - invoices state:", invoices);

  const loadInvoices = useCallback(
    async (page: number = 1) => {
      if (!clientUserId) {
        console.log("loadInvoices - no clientUserId, skipping");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log(
          "loadInvoices - calling API with clientUserId:",
          clientUserId,
          "page:",
          page
        );
        const response = await InvoiceService.getInvoicesByClient(
          clientUserId,
          page,
          limit
        );
        console.log("loadInvoices - API response:", response);

        if (response && response.items) {
          setInvoices(response.items);
          setTotalPages(response.totalPages || 1);
          setTotal(response.total || 0);
          console.log("loadInvoices - set invoices:", response.items);
        } else {
          setInvoices([]);
          setTotalPages(1);
          setTotal(0);
          console.log("loadInvoices - no items in response");
        }
      } catch (err) {
        console.error("loadInvoices - error:", err);
        setError("Erreur lors du chargement des factures");
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    },
    [clientUserId, limit]
  );

  useEffect(() => {
    loadInvoices(currentPage);
  }, [loadInvoices, currentPage]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EN_ATTENTE":
        return "bg-yellow-100 text-yellow-800";
      case "PAYEE":
        return "bg-green-100 text-green-800";
      case "ANNULEE":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "EN_ATTENTE":
        return "En attente";
      case "PAYEE":
        return "Payée";
      case "ANNULEE":
        return "Annulée";
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat("fr-MG", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + " Ar"
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePayment = (invoice: Invoice) => {
    setPaymentModal({ invoice, isOpen: true });
    setSelectedDelayPricingId(null);
    setDelayDays(0);
    setCalculatedAmount(invoice.montantTotal);
  };

  const handleClosePaymentModal = () => {
    setPaymentModal({ invoice: {} as Invoice, isOpen: false });
    setSelectedDelayPricingId(null);
    setDelayDays(0);
    setCalculatedAmount(0);
  };

  const handleDelayPricingChange = async (
    pricingId: number | null,
    days: number
  ) => {
    setSelectedDelayPricingId(pricingId);
    setDelayDays(days);

    if (pricingId && days > 0) {
      try {
        const result = await PaymentService.calculatePaymentAmount({
          invoiceId: paymentModal.invoice.id,
          delayDays: days,
          delayPricingId: pricingId,
        });
        setCalculatedAmount(result.totalAmount);
      } catch (error) {
        console.error("Erreur lors du calcul du montant:", error);
        setCalculatedAmount(paymentModal.invoice.montantTotal);
      }
    } else {
      setCalculatedAmount(paymentModal.invoice.montantTotal);
    }
  };

  const handleProcessPayment = async (
    paymentMethod: "MOBILE_MONEY" | "CASH"
  ) => {
    if (!clientUserId) return;

    setIsProcessingPayment(true);
    try {
      const paymentData = {
        invoiceId: paymentModal.invoice.id,
        userId: clientUserId,
        paymentMethod,
        delayPricingId: selectedDelayPricingId || 1, // Default pricing ID
        dueDate: new Date(
          Date.now() + delayDays * 24 * 60 * 60 * 1000
        ).toISOString(),
        delayDays,
        notes: `Paiement de la facture ${paymentModal.invoice.numeroFacture}`,
      };

      await PaymentService.createPayment(paymentData);

      // Fermer la modal et recharger les factures
      handleClosePaymentModal();
      loadInvoices(currentPage);

      alert("Paiement initié avec succès !");
    } catch (error) {
      console.error("Erreur lors du paiement:", error);
      alert("Erreur lors du traitement du paiement");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleDownloadPdf = async (invoiceId: number) => {
    try {
      setDownloadingPdf(invoiceId);
      await InvoiceService.downloadInvoicePdf(
        invoiceId,
        `facture-${invoiceId}.pdf`
      );
    } catch (err) {
      console.error("Erreur lors du téléchargement du PDF:", err);
      alert("Erreur lors du téléchargement de la facture");
    } finally {
      setDownloadingPdf(null);
    }
  };

  const filteredInvoices = (invoices || []).filter((invoice) => {
    if (selectedStatus === "ALL") return true;
    return invoice.statut === selectedStatus;
  });

  console.log("InvoicesPage - filteredInvoices:", filteredInvoices);
  console.log("InvoicesPage - selectedStatus:", selectedStatus);
  console.log(
    "InvoicesPage - invoices with status:",
    invoices.map((inv) => ({ id: inv.id, statut: inv.statut }))
  );

  return (
    <DashboardLayout
      title="Mes Factures"
      description="Consultez et payez vos factures"
    >
      <div className="bg-gray-50 rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Filtrer par statut
            </label>
            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as InvoiceStatus)
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0486e4] focus:border-[#0486e4] transition-colors bg-white text-gray-900 font-medium"
            >
              <option value="ALL" className="text-gray-900">
                Tous les statuts
              </option>
              <option value="EN_ATTENTE" className="text-gray-900">
                En attente
              </option>
              <option value="PAYEE" className="text-gray-900">
                Payées
              </option>
              <option value="ANNULEE" className="text-gray-900">
                Annulées
              </option>
            </select>
          </div>
          <div className="text-sm text-gray-700 bg-white px-3 py-2 rounded-md border border-gray-200">
            <span className="font-semibold text-gray-900">{total}</span>{" "}
            facture(s) au total
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0486e4]/10 mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0486e4] border-t-transparent"></div>
            </div>
            <p className="text-gray-600 font-medium">
              Chargement des factures...
            </p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg
                className="w-8 h-8 text-red-600"
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
            </div>
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={() => loadInvoices(currentPage)}
              className="mt-4 px-4 py-2 bg-[#0486e4] text-white rounded-lg hover:bg-[#0369a1] transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Aucune facture trouvée</p>
            <p className="text-gray-400 text-sm mt-1">
              {selectedStatus !== "ALL"
                ? "Essayez de modifier vos filtres"
                : "Vos factures apparaîtront ici"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Numéro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.numeroFacture}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {invoice.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(invoice.dateFacture)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(invoice.montantTotal)}
                        </div>
                        {invoice.notes && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {invoice.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            invoice.statut
                          )}`}
                        >
                          {getStatusText(invoice.statut)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDownloadPdf(invoice.id)}
                            disabled={downloadingPdf === invoice.id}
                            className="inline-flex items-center px-3 py-1.5 bg-[#0486e4] text-white rounded-lg hover:bg-[#0369a1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            {downloadingPdf === invoice.id ? "..." : "PDF"}
                          </button>
                          {invoice.statut === "EN_ATTENTE" && (
                            <button
                              onClick={() => handlePayment(invoice)}
                              className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
                            >
                              <CreditCard className="w-3 h-3 mr-1" />
                              Payer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Page <span className="font-medium">{currentPage}</span>{" "}
                        sur <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Précédent</span>
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Suivant</span>
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de paiement */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Payer la facture
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Facture {paymentModal.invoice.numeroFacture}
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant de base
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(paymentModal.invoice.montantTotal)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner un délai de paiement
                  </label>
                  <select
                    value={selectedDelayPricingId || ""}
                    onChange={(e) => {
                      const pricingId = e.target.value
                        ? parseInt(e.target.value)
                        : null;
                      const selectedPricing = pricings.find(
                        (p) => p.id === pricingId
                      );
                      handleDelayPricingChange(
                        pricingId,
                        selectedPricing ? selectedPricing.delayMinDays : 0
                      );
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-[#0486e4] focus:border-[#0486e4]"
                  >
                    <option value="">Paiement immédiat (pas de frais)</option>
                    {pricings.map((pricing) => (
                      <option key={pricing.id} value={pricing.id}>
                        {pricing.label} - {pricing.feeRate}% de frais
                      </option>
                    ))}
                  </select>
                </div>

                {selectedDelayPricingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de jours de délai
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={delayDays}
                      onChange={(e) =>
                        handleDelayPricingChange(
                          selectedDelayPricingId,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-[#0486e4] focus:border-[#0486e4]"
                    />
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Montant total à payer:
                    </span>
                    <span className="text-lg font-bold text-[#0486e4]">
                      {formatCurrency(calculatedAmount)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Méthode de paiement
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleProcessPayment("MOBILE_MONEY")}
                      disabled={isProcessingPayment}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.9 14.4c-.5 0-.9.4-.9.9v2.7c0 .5.4.9.9.9s.9-.4.9-.9v-2.7c0-.5-.4-.9-.9-.9z" />
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.9 14.4c-.5 0-.9.4-.9.9v.9c0 1.7-1.4 3.1-3.1 3.1H9.1c-1.7 0-3.1-1.4-3.1-3.1v-.9c0-.5-.4-.9-.9-.9s-.9.4-.9.9v.9c0 2.8 2.3 5.1 5.1 5.1h4.8c2.8 0 5.1-2.3 5.1-5.1v-.9c0-.5-.4-.9-.9-.9z" />
                      </svg>
                      Payer par Mobile Money
                    </button>
                    <button
                      onClick={() => handleProcessPayment("CASH")}
                      disabled={isProcessingPayment}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.4-1.4 3.6 3.6 7.6-7.6L19 8l-9 9z" />
                      </svg>
                      Payer en espèces au bureau
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleClosePaymentModal}
                disabled={isProcessingPayment}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
