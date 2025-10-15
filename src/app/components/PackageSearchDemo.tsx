"use client";

import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { usePackageHistory, useReferenceData, useSmallPackages } from "@/hooks";
import { useState } from "react";

const PackageSearchDemo = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null
  );

  const {
    packages,
    loading: packagesLoading,
    error: packagesError,
    searchPackages,
    getPackageByTrackingCode,
  } = useSmallPackages();

  const {
    deliveryModes,
    statuses,
    loading: refDataLoading,
  } = useReferenceData();

  const {
    history,
    loading: historyLoading,
    getPackageHistory,
  } = usePackageHistory();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      // Rechercher par code de suivi d'abord
      const packageByTracking = await getPackageByTrackingCode(searchTerm);
      if (packageByTracking) {
        console.log("Package trouvé par code de suivi:", packageByTracking);
        return;
      }
    } catch {
      // Si pas trouvé par code de suivi, faire une recherche générale
      console.log("Recherche générale...");
    }

    // Recherche générale
    await searchPackages({
      trackingCode: searchTerm,
      page: 1,
      limit: 10,
    });
  };

  const handleViewHistory = async (packageId: string) => {
    setSelectedPackageId(packageId);
    await getPackageHistory(packageId);
  };

  const getDeliveryModeLabel = (modeId: string) => {
    const mode = deliveryModes.find((m) => m.id.toString() === modeId);
    return mode ? `${mode.mode} (${mode.fee}€)` : `Mode ${modeId}`;
  };

  const getStatusLabel = (statusId: string) => {
    const status = statuses.find((s) => s.id.toString() === statusId);
    return status ? status.name : `Statut ${statusId}`;
  };

  if (refDataLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Démo de Recherche de Colis</h1>

      {/* Section recherche */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Rechercher un colis</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Code de suivi ou nom du colis"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button
            onClick={handleSearch}
            disabled={packagesLoading || !searchTerm.trim()}
          >
            {packagesLoading ? "Recherche..." : "Rechercher"}
          </Button>
        </div>

        {packagesError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {packagesError}
          </div>
        )}
      </Card>

      {/* Informations sur les données de référence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Modes de livraison disponibles</h3>
          <ul className="text-sm space-y-1">
            {deliveryModes.map((mode) => (
              <li key={mode.id} className="flex justify-between">
                <span>{mode.mode}</span>
                <span>{mode.fee}€</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">Statuts disponibles</h3>
          <ul className="text-sm space-y-1">
            {statuses.map((status) => (
              <li key={status.id} className="flex items-center gap-2">
                {status.color && (
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                )}
                <span>{status.name}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Résultats de la recherche */}
      {packages && packages.data.length > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Résultats ({packages.total} colis trouvé
            {packages.total > 1 ? "s" : ""})
          </h2>

          <div className="space-y-4">
            {packages.data.map((pkg) => (
              <div
                key={pkg.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{pkg.packageName}</h3>
                    <p className="text-gray-600">Code: {pkg.trackingCode}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewHistory(pkg.id)}
                    disabled={historyLoading}
                  >
                    Voir l&apos;historique
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Mode de livraison:</span>
                    <span className="ml-2">
                      {getDeliveryModeLabel(pkg.deliveryModeId)}
                    </span>
                  </div>
                  {pkg.statusId && (
                    <div>
                      <span className="text-gray-500">Statut:</span>
                      <span className="ml-2">
                        {getStatusLabel(pkg.statusId)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {packages.total > packages.limit && (
            <div className="mt-4 text-sm text-gray-600">
              Affichage de {packages.data.length} sur {packages.total} résultats
            </div>
          )}
        </Card>
      )}

      {/* Historique du colis sélectionné */}
      {selectedPackageId && history.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            Historique du colis {selectedPackageId}
          </h2>

          <div className="space-y-3">
            {history.map((entry) => (
              <div key={entry.id} className="flex gap-4 p-3 bg-gray-50 rounded">
                <div className="flex-shrink-0 w-20 text-xs text-gray-500">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{entry.action}</div>
                  <div className="text-sm text-gray-600">
                    {entry.description}
                  </div>
                  {entry.user && (
                    <div className="text-xs text-gray-500">
                      Par {entry.user.firstname} {entry.user.lastname}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PackageSearchDemo;
