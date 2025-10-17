"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Invoice, InvoiceService } from "@/services/invoice.service";
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

export default function InvoicesPage() {
  const { clientUserId } = useCurrentUser();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [downloadingPdf, setDownloadingPdf] = useState<number | null>(null);
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

  const handlePayment = (invoiceId: number) => {
    console.log("Redirection vers le paiement pour la facture:", invoiceId);
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
                              onClick={() => handlePayment(invoice.id)}
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
    </DashboardLayout>
  );
}
