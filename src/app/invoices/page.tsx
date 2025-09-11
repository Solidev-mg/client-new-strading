"use client";

import {
  Invoice,
  InvoiceStatus,
  PaymentMethod,
} from "@/app/modules/invoice/domain/entities/invoice.entity";
import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | "ALL">(
    "ALL"
  );

  // Mock data pour démonstration
  const mockInvoices: Invoice[] = useMemo(
    () => [
      {
        id: "INV-001",
        userId: "user1",
        containerNumber: "CONT-2024-001",
        packages: [
          {
            packageId: "pkg1",
            trackingNumber: "TR123456789",
            customName: "Électronique",
            weight: 2.5,
            shippingCost: 25000,
            serviceFee: 5000,
          },
          {
            packageId: "pkg2",
            trackingNumber: "TR987654321",
            customName: "Vêtements",
            weight: 1.8,
            shippingCost: 18000,
            serviceFee: 3600,
          },
        ],
        subtotal: 43000,
        taxes: 4300,
        fees: 8600,
        total: 55900,
        currency: "MGA",
        status: InvoiceStatus.PENDING,
        dueDate: new Date("2024-04-15"),
        createdAt: new Date("2024-03-15"),
        updatedAt: new Date("2024-03-15"),
      },
      {
        id: "INV-002",
        userId: "user1",
        containerNumber: "CONT-2024-002",
        packages: [
          {
            packageId: "pkg3",
            trackingNumber: "TR555666777",
            customName: "Livres",
            weight: 3.2,
            shippingCost: 32000,
            serviceFee: 6400,
          },
        ],
        subtotal: 32000,
        taxes: 3200,
        fees: 6400,
        total: 41600,
        currency: "MGA",
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.MOBILE_MONEY,
        dueDate: new Date("2024-03-20"),
        paidAt: new Date("2024-03-18"),
        createdAt: new Date("2024-03-10"),
        updatedAt: new Date("2024-03-18"),
      },
    ],
    []
  );

  const filteredInvoices = useMemo(() => {
    if (selectedStatus === "ALL") {
      return mockInvoices;
    }
    return mockInvoices.filter((invoice) => invoice.status === selectedStatus);
  }, [mockInvoices, selectedStatus]);

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setInvoices(filteredInvoices);
    } catch (error) {
      console.error("Erreur lors du chargement des factures:", error);
    } finally {
      setLoading(false);
    }
  }, [filteredInvoices]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case InvoiceStatus.PAID:
        return "bg-green-100 text-green-800";
      case InvoiceStatus.OVERDUE:
        return "bg-red-100 text-red-800";
      case InvoiceStatus.CANCELLED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PENDING:
        return "En attente";
      case InvoiceStatus.PAID:
        return "Payée";
      case InvoiceStatus.OVERDUE:
        return "En retard";
      case InvoiceStatus.CANCELLED:
        return "Annulée";
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-MG", {
      style: "currency",
      currency: "MGA",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePayment = (invoiceId: string) => {
    // Redirection vers la page de paiement
    console.log("Redirection vers le paiement pour la facture:", invoiceId);
  };

  const downloadInvoice = (invoiceId: string) => {
    // Téléchargement de la facture
    console.log("Téléchargement de la facture:", invoiceId);
  };

  return (
    <DashboardLayout
      title="Mes Factures"
      description="Consultez et payez vos factures"
    >
      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par statut
            </label>
            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as InvoiceStatus | "ALL")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tous les statuts</option>
              <option value={InvoiceStatus.PENDING}>En attente</option>
              <option value={InvoiceStatus.PAID}>Payées</option>
              <option value={InvoiceStatus.OVERDUE}>En retard</option>
              <option value={InvoiceStatus.CANCELLED}>Annulées</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des factures */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement des factures...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Aucune facture trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facture
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conteneur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Échéance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.packages.length} colis
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.containerNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.total)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Sous-total: {formatCurrency(invoice.subtotal)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {getStatusText(invoice.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.dueDate.toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => downloadInvoice(invoice.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Télécharger
                        </button>
                        {invoice.status === InvoiceStatus.PENDING && (
                          <button
                            onClick={() => handlePayment(invoice.id)}
                            className="text-green-600 hover:text-green-900"
                          >
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
        )}
      </div>
    </DashboardLayout>
  );
}
