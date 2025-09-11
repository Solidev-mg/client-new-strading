"use client";

import {
  Package,
  PackageFilter,
  PackageStatus,
} from "@/app/modules/package/domain/entities/package.entity";
import {
  GetPackagesUsecase,
  SearchPackagesUsecase,
} from "@/app/modules/package/domain/usecases/package.usecase";
import { ApiPackageRepository } from "@/app/modules/package/infrastructure/gateway/api.package.repository";
import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<PackageStatus | "ALL">(
    "ALL"
  );
  const [searchTerm, setSearchTerm] = useState("");

  const packageRepository = useMemo(() => new ApiPackageRepository(), []);
  const getPackagesUsecase = useMemo(
    () => new GetPackagesUsecase(packageRepository),
    [packageRepository]
  );
  const searchPackagesUsecase = useMemo(
    () => new SearchPackagesUsecase(packageRepository),
    [packageRepository]
  );

  const loadPackages = useCallback(async () => {
    try {
      setLoading(true);
      const filter: PackageFilter = {};

      if (selectedStatus !== "ALL") {
        filter.status = selectedStatus as PackageStatus;
      }

      const packagesData = await getPackagesUsecase.execute(filter);
      setPackages(packagesData);
    } catch (error) {
      console.error("Erreur lors du chargement des colis:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, getPackagesUsecase]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadPackages();
      return;
    }

    try {
      setLoading(true);
      const packagesData = await searchPackagesUsecase.execute(searchTerm);
      setPackages(packagesData);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: PackageStatus) => {
    switch (status) {
      case PackageStatus.RECEIVED_IN_CHINA:
        return "bg-blue-100 text-blue-800";
      case PackageStatus.IN_TRANSIT:
        return "bg-yellow-100 text-yellow-800";
      case PackageStatus.ARRIVED_IN_MADAGASCAR:
        return "bg-green-100 text-green-800";
      case PackageStatus.RETRIEVED:
        return "bg-gray-100 text-gray-800";
      case PackageStatus.SHIPPING_MODE_CHANGED:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: PackageStatus) => {
    switch (status) {
      case PackageStatus.RECEIVED_IN_CHINA:
        return "Réception en Chine";
      case PackageStatus.IN_TRANSIT:
        return "En transit";
      case PackageStatus.ARRIVED_IN_MADAGASCAR:
        return "Arrivée à Madagascar";
      case PackageStatus.RETRIEVED:
        return "Récupéré";
      case PackageStatus.SHIPPING_MODE_CHANGED:
        return "Mode d'envoi modifié";
      default:
        return status;
    }
  };

  return (
    <DashboardLayout title="Mes Colis" description="Gérez et suivez vos colis">
      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Filtre par statut */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par statut
            </label>
            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as PackageStatus | "ALL")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tous les statuts</option>
              <option value={PackageStatus.RECEIVED_IN_CHINA}>
                Réception en Chine
              </option>
              <option value={PackageStatus.IN_TRANSIT}>En transit</option>
              <option value={PackageStatus.ARRIVED_IN_MADAGASCAR}>
                Arrivée à Madagascar
              </option>
              <option value={PackageStatus.RETRIEVED}>Récupéré</option>
              <option value={PackageStatus.SHIPPING_MODE_CHANGED}>
                Mode d&apos;envoi modifié
              </option>
            </select>
          </div>

          {/* Barre de recherche */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Numéro de tracking ou nom personnalisé"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des colis */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement des colis...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Aucun colis trouvé</p>
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
                    Mode d&apos;envoi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de création
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
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          packageItem.status
                        )}`}
                      >
                        {getStatusText(packageItem.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {packageItem.shippingMode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(packageItem.createdAt).toLocaleDateString(
                        "fr-FR"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-4">
                        Voir détails
                      </button>
                      <button className="text-green-600 hover:text-green-900 mr-4">
                        Historique
                      </button>
                      <button className="text-purple-600 hover:text-purple-900">
                        Renommer
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
