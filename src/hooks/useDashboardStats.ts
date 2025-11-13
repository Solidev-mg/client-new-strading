"use client";

import { useEffect, useState } from "react";
import { notificationRepository } from "../app/modules/notification";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { InvoiceService } from "../services/invoice.service";
import { SmallPackageService } from "../services/small-package.service";

interface DashboardStats {
  packagesInProgress: number;
  newNotifications: number;
  unpaidInvoices: number;
  loading: boolean;
  error: string | null;
}

export function useDashboardStats(): DashboardStats {
  const { clientUserId } = useCurrentUser();
  const [stats, setStats] = useState<DashboardStats>({
    packagesInProgress: 0,
    newNotifications: 0,
    unpaidInvoices: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const loadStats = async () => {
      if (!clientUserId) {
        setStats((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        setStats((prev) => ({ ...prev, loading: true, error: null }));

        // Load packages in progress - using getAllSmallPackages for now (admin method, but should work)
        const packagesResponse = await SmallPackageService.getAllSmallPackages(
          1,
          1000
        );
        const packagesInProgress = packagesResponse?.data?.length || 0; // For now, count all packages

        // Load unpaid invoices
        const invoicesResponse = await InvoiceService.getInvoicesByClient(
          clientUserId,
          1,
          1000
        );
        const unpaidInvoices =
          invoicesResponse?.items?.filter((inv) => inv.statut === "UNPAID")
            .length || 0;

        // Load new notifications count
        const newNotifications = await notificationRepository.getUnreadCount();

        setStats({
          packagesInProgress,
          newNotifications,
          unpaidInvoices,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error("Error loading dashboard stats:", err);
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: "Erreur lors du chargement des statistiques",
        }));
      }
    };

    loadStats();
  }, [clientUserId]);

  return stats;
}
