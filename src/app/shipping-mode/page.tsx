"use client";

import { useReferenceData } from "@/hooks/useReferenceData";
import { useSmallPackages } from "@/hooks/useSmallPackages";
import { SmallPackageService } from "@/services";
import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

interface SmallPackageWithDetails {
  id: string;
  userId: string;
  deliveryModeId: string;
  trackingCode: string;
  packageName: string;
  statusId?: number;
  createdAt: string;
  updatedAt: string;
  deliveryMode?: {
    id: number;
    mode: string;
    fee: number;
  };
  status?: {
    id: number;
    name: string;
  };
  weight?: number;
  isRecuperated?: boolean;
}

export default function ShippingModePage() {
  const {
    packages: smallPackages,
    loading: packagesLoading,
    searchPackages,
  } = useSmallPackages();
  const { deliveryModes, loading: refLoading } = useReferenceData();
  const [selectedPackage, setSelectedPackage] =
    useState<SmallPackageWithDetails | null>(null);
  const [newDeliveryModeId, setNewDeliveryModeId] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [changing, setChanging] = useState(false);

  // Filtrer les colis éligibles (pas encore récupérés)
  const eligiblePackages = useMemo(() => {
    if (!smallPackages?.data) return [];
    // TODO: Filter by isRecuperated when available
    return smallPackages.data as SmallPackageWithDetails[];
  }, [smallPackages]);

  const loadPackages = useCallback(async () => {
    try {
      await searchPackages({}); // Load all packages
    } catch (error) {
      console.error("Erreur lors du chargement des colis:", error);
    }
  }, [searchPackages]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const getStatusText = (statusId?: number) => {
    // Simple mapping - can be improved with actual status data
    return `Statut ${statusId || "N/A"}`;
  };

  const getAvailableDeliveryModes = () => {
    if (deliveryModes.length > 0) return deliveryModes;
    // Default modes if API doesn't return any
    return [
      { id: 1, mode: "Maritime", fee: 5000 },
      { id: 2, mode: "Aérien", fee: 15000 },
      { id: 3, mode: "Express", fee: 25000 },
    ];
  };

  const availableModes = getAvailableDeliveryModes();

  const getShippingModeIcon = (mode?: string) => {
    switch (mode) {
      case "Maritime":
        return "🚢";
      case "Aérien":
        return "✈️";
      case "Express":
        return "🚀";
      default:
        return "📦";
    }
  };

  const canChangeShippingMode = (packageItem: SmallPackageWithDetails) => {
    // On peut changer le mode d'envoi seulement si le colis n'est pas encore récupéré
    return !packageItem.isRecuperated;
  };

  const openChangeModal = (packageItem: SmallPackageWithDetails) => {
    setSelectedPackage(packageItem);
    setNewDeliveryModeId(packageItem.deliveryModeId);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedPackage(null);
    setShowModal(false);
  };

  const handleSubmitChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPackage) return;

    try {
      setChanging(true);

      // Appeler l'API pour changer le mode
      await SmallPackageService.changeDeliveryMode(
        selectedPackage.id,
        newDeliveryModeId
      );

      // Recharger les colis
      await loadPackages();
      closeModal();

      alert(
        `Mode d'envoi changé avec succès pour le colis ${selectedPackage.trackingCode}`
      );
    } catch (error) {
      console.error("Erreur lors du changement de mode d'envoi:", error);
      alert("Erreur lors du changement de mode d'envoi");
    } finally {
      setChanging(false);
    }
  };

  return (
    <DashboardLayout
      title="Changement de Mode d'Envoi"
      description="Modifiez le mode d'envoi de vos colis non encore expédiés"
    >
      <div className="bg-white rounded-lg shadow-sm border">
        {packagesLoading || refLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement des colis...</p>
          </div>
        ) : eligiblePackages.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500">
              Aucun colis éligible pour un changement de mode d&apos;envoi
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Colis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mode actuel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Poids
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {eligiblePackages.map(
                  (packageItem: SmallPackageWithDetails) => (
                    <tr key={packageItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {packageItem.packageName ||
                              packageItem.trackingCode}
                          </div>
                          <div className="text-sm text-gray-500">
                            {packageItem.trackingCode}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {packageItem.status?.name ||
                            getStatusText(packageItem.statusId)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">
                            {getShippingModeIcon(
                              packageItem.deliveryMode?.mode
                            )}
                          </span>
                          <span className="text-sm text-gray-900">
                            {packageItem.deliveryMode?.mode || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {packageItem.weight
                          ? `${packageItem.weight} kg`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {canChangeShippingMode(packageItem) ? (
                          <button
                            onClick={() => openChangeModal(packageItem)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Changer le mode
                          </button>
                        ) : (
                          <span className="text-gray-400">Non modifiable</span>
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de changement */}
      {showModal && selectedPackage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Changer le mode d&apos;envoi
              </h3>

              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">
                  Colis: {selectedPackage.packageName}
                </p>
                <p className="text-sm text-gray-600">
                  Tracking: {selectedPackage.trackingCode}
                </p>
                <p className="text-sm text-gray-600">
                  Mode actuel: {selectedPackage.deliveryMode?.mode}
                </p>
              </div>

              <form onSubmit={handleSubmitChange}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mode d&apos;envoi
                  </label>
                  <select
                    value={newDeliveryModeId}
                    onChange={(e) => setNewDeliveryModeId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {availableModes.map((mode) => (
                      <option key={mode.id} value={mode.id.toString()}>
                        {getShippingModeIcon(mode.mode)} {mode.mode} ({mode.fee}{" "}
                        MGA)
                      </option>
                    ))}
                  </select>
                </div>

                {newDeliveryModeId !== selectedPackage.deliveryModeId && (
                  <div className="mb-4 p-3 bg-blue-50 rounded">
                    {(() => {
                      const currentMode = availableModes.find(
                        (m) =>
                          m.id.toString() === selectedPackage.deliveryModeId
                      );
                      const newMode = availableModes.find(
                        (m) => m.id.toString() === newDeliveryModeId
                      );
                      const currentCost = currentMode
                        ? currentMode.fee * (selectedPackage.weight || 1)
                        : 0;
                      const newCost = newMode
                        ? newMode.fee * (selectedPackage.weight || 1)
                        : 0;
                      const difference = newCost - currentCost;
                      return (
                        <div className="text-sm">
                          <p className="text-gray-600">Estimation des coûts:</p>
                          <p className="text-gray-600">
                            Coût actuel: {currentCost.toLocaleString()} MGA
                          </p>
                          <p className="text-gray-600">
                            Nouveau coût: {newCost.toLocaleString()} MGA
                          </p>
                          <p
                            className={`font-medium ${
                              difference >= 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            Différence: {difference >= 0 ? "+" : ""}
                            {difference.toLocaleString()} MGA
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={
                      changing ||
                      newDeliveryModeId === selectedPackage.deliveryModeId
                    }
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {changing ? "Modification..." : "Confirmer"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
