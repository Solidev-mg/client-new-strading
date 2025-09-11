"use client";

import {
  Package,
  PackageStatus,
  ShippingMode,
} from "@/app/modules/package/domain/entities/package.entity";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

export default function ShippingModePage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data pour les colis modifiables
  const mockPackages: Package[] = useMemo(
    () => [
      {
        id: "1",
        userId: "user1",
        trackingNumber: "TR123456789",
        customName: "iPhone 15 Pro",
        description: "Smartphone Apple iPhone 15 Pro 256GB",
        weight: 0.5,
        dimensions: { length: 15, width: 8, height: 2 },
        shippingMode: ShippingMode.SEA,
        status: PackageStatus.RECEIVED_IN_CHINA,
        value: 1200,
        currency: "USD",
        createdAt: new Date("2024-03-15T10:30:00"),
        updatedAt: new Date("2024-03-15T10:30:00"),
        history: [],
      },
      {
        id: "2",
        userId: "user1",
        trackingNumber: "TR987654321",
        customName: "Laptop Gaming",
        description: "Ordinateur portable gaming",
        weight: 2.5,
        dimensions: { length: 35, width: 25, height: 3 },
        shippingMode: ShippingMode.AIR,
        status: PackageStatus.RECEIVED_IN_CHINA,
        value: 800,
        currency: "USD",
        createdAt: new Date("2024-03-14T15:45:00"),
        updatedAt: new Date("2024-03-14T15:45:00"),
        history: [],
      },
    ],
    []
  );

  // Charger les colis
  useEffect(() => {
    const loadPackages = async () => {
      setLoading(true);
      // Simuler un appel API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Filtrer seulement les colis qui peuvent être modifiés (statut RECEIVED_IN_CHINA)
      const modifiablePackages = mockPackages.filter(
        (pkg) => pkg.status === PackageStatus.RECEIVED_IN_CHINA
      );
      setPackages(modifiablePackages);
      setLoading(false);
    };

    loadPackages();
  }, [mockPackages]);

  const getShippingModeText = (mode: ShippingMode) => {
    switch (mode) {
      case ShippingMode.SEA:
        return "Transport maritime";
      case ShippingMode.AIR:
        return "Transport aérien";
      case ShippingMode.EXPRESS:
        return "Express";
      default:
        return mode;
    }
  };

  const getShippingModeColor = (mode: ShippingMode) => {
    switch (mode) {
      case ShippingMode.SEA:
        return "bg-blue-100 text-blue-800";
      case ShippingMode.AIR:
        return "bg-green-100 text-green-800";
      case ShippingMode.EXPRESS:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout
      title="Changement de Mode d'Envoi"
      description="Modifiez le mode d'envoi de vos colis non encore expédiés"
    >
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement des colis...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500">Aucun colis modifiable trouvé</p>
            <p className="text-sm text-gray-400 mt-2">
              Seuls les colis ayant le statut &quot;Reçu en Chine&quot; peuvent
              être modifiés
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Colis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mode actuel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Poids
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valeur déclarée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de réception
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {packages.map((packageItem) => (
                  <tr key={packageItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {packageItem.customName || packageItem.trackingNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {packageItem.trackingNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getShippingModeColor(
                          packageItem.shippingMode
                        )}`}
                      >
                        {getShippingModeText(packageItem.shippingMode)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {packageItem.weight} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {packageItem.value?.toLocaleString()}{" "}
                      {packageItem.currency || "USD"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(packageItem.createdAt).toLocaleDateString(
                        "fr-FR"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        Modifier le mode
                      </button>
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
