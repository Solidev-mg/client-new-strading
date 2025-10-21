/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useReferenceData } from "@/hooks/useReferenceData";
import { useSmallPackages } from "@/hooks/useSmallPackages";
import { SmallPackageService } from "@/services";
import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

interface SmallPackageWithDetails {
  id: string;
  userId: string | number;
  deliveryModeId: string;
  trackingCode: string;
  packageName: string;
  statusId?: string;
  createdAt: string;
  updatedAt: string;
  deliveryMode?: {
    id: string | number;
    mode: string;
    fee: number;
  };
  status?: {
    id: string | number;
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
  const {
    deliveryModes,
    loading: refLoading,
    error: refError,
  } = useReferenceData();
  const [selectedPackage, setSelectedPackage] =
    useState<SmallPackageWithDetails | null>(null);
  const [newDeliveryModeId, setNewDeliveryModeId] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [changing, setChanging] = useState(false);

  const eligiblePackages = useMemo(() => {
    if (!smallPackages?.data || !Array.isArray(smallPackages.data)) {
      return [];
    }

    return smallPackages.data.filter(
      (pkg: any) => pkg.isRecuperated === false
    ) as SmallPackageWithDetails[];
  }, [smallPackages]);

  const loadPackages = useCallback(async () => {
    try {
      await searchPackages({});
    } catch (error) {
      console.error("Erreur lors du chargement des colis:", error);
    }
  }, [searchPackages]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const getStatusText = (statusId?: string | number) => {
    return `Statut ${statusId || "N/A"}`;
  };

  const availableModes = deliveryModes;

  const canChangeShippingMode = (packageItem: SmallPackageWithDetails) => {
    return !packageItem.isRecuperated && !refError && availableModes.length > 0;
  };

  const openChangeModal = (packageItem: SmallPackageWithDetails) => {
    setSelectedPackage(packageItem);
    const currentModeId = packageItem.deliveryModeId?.toString() || "";

    const modeExists = availableModes.some(
      (mode) => mode.id.toString() === currentModeId
    );

    if (modeExists) {
      setNewDeliveryModeId(currentModeId);
    } else {
      setNewDeliveryModeId(
        availableModes.length > 0 ? availableModes[0].id.toString() : ""
      );
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedPackage(null);
    setShowModal(false);
  };

  const handleSubmitChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPackage || !newDeliveryModeId) {
      alert("Veuillez sélectionner un mode de livraison valide");
      return;
    }

    const selectedMode = availableModes.find(
      (mode) => mode.id.toString() === newDeliveryModeId
    );
    if (!selectedMode) {
      alert("Le mode de livraison sélectionné n'est pas valide");
      return;
    }

    try {
      setChanging(true);

      await SmallPackageService.changeDeliveryMode(
        selectedPackage.id,
        newDeliveryModeId
      );

      await loadPackages();
      closeModal();

      alert(
        `Mode d'envoi changé avec succès pour le colis ${selectedPackage.trackingCode} vers ${selectedMode.mode}`
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
            <p className="text-gray-500 text-lg font-medium">
              Aucun colis éligible pour un changement de mode d&apos;envoi
            </p>
            {refError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600 text-sm font-medium">
                  ⚠️ Erreur lors du chargement des modes de livraison
                </p>
                <p className="text-red-500 text-xs mt-1">{refError}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {refError && (
              <div className="m-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 text-sm font-medium">
                  ⚠️ Erreur lors du chargement des modes de livraison
                </p>
                <p className="text-yellow-600 text-xs mt-1">{refError}</p>
              </div>
            )}
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Colis
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Mode d&apos;envoi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Poids
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {eligiblePackages.map(
                  (packageItem: SmallPackageWithDetails) => (
                    <tr
                      key={packageItem.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {packageItem.packageName ||
                              packageItem.trackingCode}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {packageItem.trackingCode}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {packageItem.status?.name ||
                            getStatusText(packageItem.statusId)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {packageItem.deliveryMode?.mode || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {packageItem.weight
                            ? `${packageItem.weight} kg`
                            : "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {canChangeShippingMode(packageItem) ? (
                          <button
                            onClick={() => openChangeModal(packageItem)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          >
                            Changer le mode
                          </button>
                        ) : (
                          <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded-md cursor-not-allowed">
                            Non modifiable
                          </span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Changer le mode d&apos;envoi
              </h3>
              <p className="text-sm text-gray-600">
                Sélectionnez un nouveau mode de livraison pour votre colis
              </p>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Colis:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {selectedPackage.packageName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Tracking:
                  </span>
                  <span className="text-sm font-mono text-gray-900">
                    {selectedPackage.trackingCode}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Mode actuel:
                  </span>
                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {selectedPackage.deliveryMode?.mode}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitChange} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Nouveau mode d&apos;envoi
                </label>
                <select
                  value={newDeliveryModeId}
                  onChange={(e) => setNewDeliveryModeId(e.target.value)}
                  className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
                >
                  {availableModes.map((mode) => (
                    <option key={mode.id} value={mode.id.toString()}>
                      {mode.mode} - {Number(mode.fee).toLocaleString()} MGA
                    </option>
                  ))}
                </select>
              </div>

              {newDeliveryModeId !== selectedPackage.deliveryModeId && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  {(() => {
                    const currentMode = availableModes.find(
                      (m) => m.id.toString() === selectedPackage.deliveryModeId
                    );
                    const newMode = availableModes.find(
                      (m) => m.id.toString() === newDeliveryModeId
                    );
                    const currentCost = currentMode
                      ? Number(currentMode.fee) * (selectedPackage.weight || 1)
                      : 0;
                    const newCost = newMode
                      ? Number(newMode.fee) * (selectedPackage.weight || 1)
                      : 0;
                    const difference = newCost - currentCost;
                    return (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-blue-900 uppercase">
                          Estimation des coûts
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Coût actuel:</span>
                            <span className="font-semibold text-gray-900">
                              {currentCost.toLocaleString()} MGA
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nouveau coût:</span>
                            <span className="font-semibold text-gray-900">
                              {newCost.toLocaleString()} MGA
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-blue-200">
                            <span className="font-semibold text-gray-700">
                              Différence:
                            </span>
                            <span
                              className={`font-bold ${
                                difference >= 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {difference >= 0 ? "+" : ""}
                              {difference.toLocaleString()} MGA
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={
                    changing ||
                    newDeliveryModeId === selectedPackage.deliveryModeId
                  }
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {changing ? "Modification..." : "Confirmer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
