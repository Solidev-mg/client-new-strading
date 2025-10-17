import { Payment, PaymentService } from "@/services/payment.service";
import { useCallback, useEffect, useState } from "react";

export const usePayments = (clientId?: number, autoLoad: boolean = true) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const loadPayments = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!clientId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await PaymentService.getPaymentsByClient(
          clientId,
          page,
          limit
        );
        setPayments(response.items);
        setPagination({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        });
      } catch (err) {
        setError("Erreur lors du chargement des paiements");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [clientId]
  );

  useEffect(() => {
    if (autoLoad && clientId) {
      loadPayments();
    }
  }, [autoLoad, clientId, loadPayments]);

  return {
    payments,
    loading,
    error,
    pagination,
    loadPayments,
    refresh: () => loadPayments(pagination.page, pagination.limit),
  };
};

export const usePayment = (paymentId?: number) => {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPayment = useCallback(async () => {
    if (!paymentId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await PaymentService.getPaymentById(paymentId);
      setPayment(data);
    } catch (err) {
      setError("Erreur lors du chargement du paiement");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    loadPayment();
  }, [loadPayment]);

  return {
    payment,
    loading,
    error,
    refresh: loadPayment,
  };
};
