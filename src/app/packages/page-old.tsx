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
import {
  SmallPackage,
  SmallPackageFilter,
} from "@/app/modules/package/domain/entities/small-package.entity";
import {
  GetSmallPackagesUsecase,
  CreateInitialSmallPackageUsecase,
  SearchSmallPackagesUsecase,
} from "@/app/modules/package/domain/usecases/small-package.usecase";
import { ApiSmallPackageRepository } from "@/app/modules/package/infrastructure/gateway/api.small-package.repository";
import { Clock, Edit, Eye, Package as PackageIcon, Search, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import CreateInitialPackageModal from "../components/CreateInitialPackageModal";

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [smallPackages, setSmallPackages] = useState<SmallPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<PackageStatus | "ALL">(
    "ALL"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingPackage, setIsCreatingPackage] = useState(false);
  const [activeTab, setActiveTab] = useState<"packages" | "small-packages">("packages");

  const packageRepository = useMemo(() => new ApiPackageRepository(), []);
  const smallPackageRepository = useMemo(() => new ApiSmallPackageRepository(), []);
  
  const getPackagesUsecase = useMemo(
    () => new GetPackagesUsecase(packageRepository),
    [packageRepository]
  );
  const searchPackagesUsecase = useMemo(
    () => new SearchPackagesUsecase(packageRepository),
    [packageRepository]
  );
  
  const getSmallPackagesUsecase = useMemo(
    () => new GetSmallPackagesUsecase(smallPackageRepository),
    [smallPackageRepository]
  );
  const createInitialSmallPackageUsecase = useMemo(
    () => new CreateInitialSmallPackageUsecase(smallPackageRepository),
    [smallPackageRepository]
  );
  const searchSmallPackagesUsecase = useMemo(
    () => new SearchSmallPackagesUsecase(smallPackageRepository),
    [smallPackageRepository]
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

  const loadSmallPackages = useCallback(async () => {
    try {
      setLoading(true);
      const filter: SmallPackageFilter = {};

      if (selectedStatus !== "ALL") {
        filter.status = selectedStatus;
      }

      const result = await getSmallPackagesUsecase.execute(filter);
      setSmallPackages(result.items);
    } catch (error) {
      console.error("Erreur lors du chargement des petits colis:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, getSmallPackagesUsecase]);

  const handleCreateInitialPackage = async (data: {
    trackingCode: string;
    deliveryModeId: string;
  }) => {
    setIsCreatingPackage(true);
    try {
      await createInitialSmallPackageUsecase.execute({
        trackingCode: data.trackingCode,
        deliveryModeId: data.deliveryModeId,
      });
      
      // Recharger les données après la création
      if (activeTab === "small-packages") {
        await loadSmallPackages();
      }
    } catch (error) {
      console.error("Erreur lors de la création du colis initial:", error);
      throw error;
    } finally {
      setIsCreatingPackage(false);
    }
  };

  useEffect(() => {
    if (activeTab === "packages") {
      loadPackages();
    } else {
      loadSmallPackages();
    }
  }, [activeTab, loadPackages, loadSmallPackages]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      if (activeTab === "packages") {
        loadPackages();
      } else {
        loadSmallPackages();
      }
      return;
    }

    try {
      setLoading(true);
      if (activeTab === "packages") {
        const packagesData = await searchPackagesUsecase.execute(searchTerm);
        setPackages(packagesData);
      } else {
        const result = await searchSmallPackagesUsecase.execute(searchTerm);
        setSmallPackages(result.items);
      }
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

  // Fonctions d'aide pour gérer les deux types de colis
  const getPackageName = (packageItem: Package | SmallPackage): string => {
    if ('customName' in packageItem) {
      return packageItem.customName || packageItem.trackingNumber;
    }
    return (packageItem as SmallPackage).packageName || (packageItem as SmallPackage).trackingCode;
  };

  const getTrackingCode = (packageItem: Package | SmallPackage): string => {
    if ('trackingNumber' in packageItem) {
      return packageItem.trackingNumber;
    }
    return (packageItem as SmallPackage).trackingCode;
  };

  const getPackageStatus = (packageItem: Package | SmallPackage): string => {
    if ('status' in packageItem) {
      return getStatusText(packageItem.status);
    }
    // Pour les SmallPackage, nous utilisons les propriétés calculées
    if (packageItem.isRecuperated) return "Récupéré";
    if (packageItem.hasArrived) return "Arrivé";
    if (packageItem.isInTransit) return "En transit";
    return "En attente";
  };

  const getPackageStatusColor = (packageItem: Package | SmallPackage): string => {
    if ('status' in packageItem) {
      return getStatusColor(packageItem.status);
    }
    // Pour les SmallPackage
    if (packageItem.isRecuperated) return "bg-gray-100 text-gray-800";
    if (packageItem.hasArrived) return "bg-green-100 text-green-800";
    if (packageItem.isInTransit) return "bg-yellow-100 text-yellow-800";
    return "bg-blue-100 text-blue-800";
  };

  const getShippingMode = (packageItem: Package | SmallPackage): string => {
    if ('shippingMode' in packageItem) {
      return packageItem.shippingMode;
    }
    // Pour SmallPackage, nous utilisons deliveryModeId
    switch (packageItem.deliveryModeId) {
      case "1": return "Maritime";
      case "2": return "Aérien";
      case "3": return "Express";
      default: return "Non défini";
    }
  };

  const getCreatedAtDate = (packageItem: Package | SmallPackage): string => {
    return new Date(packageItem.createdAt).toLocaleDateString("fr-FR");
  };

  return (
    <DashboardLayout title="Mes Colis" description="Gérez et suivez vos colis">
      {/* Onglets */}
      <div className="border-b border-gray-200">
        <div className="flex px-6">
          <button
            onClick={() => setActiveTab("packages")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "packages"
                ? "border-[#0486e4] text-[#0486e4]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Colis Standards
          </button>
          <button
            onClick={() => setActiveTab("small-packages")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "small-packages"
                ? "border-[#0486e4] text-[#0486e4]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Petits Colis
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Filtre par statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer par statut
              </label>
              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as PackageStatus | "ALL")
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0486e4] focus:border-[#0486e4] transition-colors"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Numéro de tracking ou nom personnalisé"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0486e4] focus:border-[#0486e4] transition-colors"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <button
                  onClick={handleSearch}
                  className="px-6 py-2.5 bg-[#0486e4] text-white rounded-lg hover:bg-[#0369a1] focus:outline-none focus:ring-2 focus:ring-[#0486e4] focus:ring-offset-2 transition-all duration-200 flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Rechercher</span>
                </button>
              </div>
            </div>

          {/* Bouton Créer un colis (seulement pour les petits colis) */}
          {activeTab === "small-packages" && (
            <div className="flex-shrink-0">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2.5 bg-[#0486e4] text-white rounded-lg hover:bg-[#0369a1] focus:outline-none focus:ring-2 focus:ring-[#0486e4] focus:ring-offset-2 transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Créer un colis</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Liste des colis */}
      <div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0486e4]/10 mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0486e4] border-t-transparent"></div>
            </div>
            <p className="text-gray-600 font-medium">Chargement des colis...</p>
          </div>
        ) : (activeTab === "packages" ? packages.length === 0 : smallPackages.length === 0) ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">Aucun colis trouvé</p>
            <p className="text-gray-400 text-sm mt-1">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            {/* En-tête du tableau */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-3">Colis</div>
                <div className="col-span-2">Statut</div>
                <div className="col-span-2">Mode d&apos;envoi</div>
                <div className="col-span-2">Date de création</div>
                <div className="col-span-3">Actions</div>
              </div>
            </div>

            {/* Corps du tableau */}
            <div className="divide-y divide-gray-200">
              {(activeTab === "packages" ? packages : smallPackages).map((packageItem, index) => (
                <div
                  key={packageItem.id}
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  }`}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#0486e4]/10 rounded-lg flex items-center justify-center">
                          <PackageIcon className="w-5 h-5 text-[#0486e4]" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getPackageName(packageItem)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getTrackingCode(packageItem)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getPackageStatusColor(packageItem)}`}
                      >
                        {getPackageStatus(packageItem)}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900 font-medium">
                        {getShippingMode(packageItem)}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-500">
                        {getCreatedAtDate(packageItem)}
                      </span>
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center space-x-2">
                        <button className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-[#0486e4] bg-[#0486e4]/10 rounded-md hover:bg-[#0486e4]/20 transition-colors">
                          <Eye className="w-3 h-3 mr-1" />
                          Détails
                        </button>
                        <button className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors">
                          <Clock className="w-3 h-3 mr-1" />
                          Historique
                        </button>
                        <button className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors">
                          <Edit className="w-3 h-3 mr-1" />
                          Renommer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de création de colis initial */}
      <CreateInitialPackageModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateInitialPackage}
        isLoading={isCreatingPackage}
      />
    </DashboardLayout>
  );
}
