import { Invoice, InvoiceService } from "@/services/invoice.service";
import { useCallback, useEffect, useState } from "react";

export const useInvoices = (clientId?: number, autoLoad: boolean = true) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const loadInvoices = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!clientId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await InvoiceService.getInvoicesByClient(
          clientId,
          page,
          limit
        );
        setInvoices(response.items);
        setPagination({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        });
      } catch (err) {
        setError("Erreur lors du chargement des factures");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [clientId]
  );

  useEffect(() => {
    if (autoLoad && clientId) {
      loadInvoices();
    }
  }, [autoLoad, clientId, loadInvoices]);

  return {
    invoices,
    loading,
    error,
    pagination,
    loadInvoices,
    refresh: () => loadInvoices(pagination.page, pagination.limit),
  };
};

export const useInvoice = (invoiceId?: number) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInvoice = useCallback(async () => {
    if (!invoiceId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await InvoiceService.getInvoiceById(invoiceId);
      setInvoice(data);
    } catch (err) {
      setError("Erreur lors du chargement de la facture");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  return {
    invoice,
    loading,
    error,
    refresh: loadInvoice,
  };
};
