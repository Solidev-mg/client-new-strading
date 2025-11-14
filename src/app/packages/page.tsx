"use client";

import { Package } from "@/app/modules/package/domain/entities/package.entity";
import { SmallPackage } from "@/app/modules/package/domain/entities/small-package.entity";
import {
  CreateInitialSmallPackageUsecase,
  GetSmallPackagesUsecase,
  SearchSmallPackagesUsecase,
} from "@/app/modules/package/domain/usecases/small-package.usecase";
import { ApiSmallPackageRepository } from "@/app/modules/package/infrastructure/gateway/api.small-package.repository";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePackageHistory } from "@/hooks/usePackageHistory";
import { useReferenceData } from "@/hooks/useReferenceData";
import { useSmallPackages } from "@/hooks/useSmallPackages";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Package as PackageIcon,
  Plus,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import CreateInitialPackageModal from "../components/CreateInitialPackageModal";
import DashboardLayout from "../components/DashboardLayout";

export default function PackagesPage() {
  const [smallPackages, setSmallPackages] = useState<SmallPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingPackage, setIsCreatingPackage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedPackageForHistory, setSelectedPackageForHistory] =
    useState<SmallPackage | null>(null);
  const [selectedPackageForRename, setSelectedPackageForRename] =
    useState<SmallPackage | null>(null);
  const [newPackageName, setNewPackageName] = useState("");
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const limit = 10;

  // Récupérer les informations de l'utilisateur connecté
  const { clientUserId, isAuthenticated } = useCurrentUser();
  const { refreshUnreadCount } = useNotifications();

  // Hooks pour les données de référence
  const { statuses } = useReferenceData();

  // Hooks pour l'historique et les opérations sur les colis
  const {
    history,
    loading: historyLoading,
    getPackageHistory,
  } = usePackageHistory();
  const { renamePackage } = useSmallPackages();

  const smallPackageRepository = useMemo(
    () => new ApiSmallPackageRepository(),
    []
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

  const loadSmallPackages = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);

        const offset = (page - 1) * limit;

        console.log("loadSmallPackages - selectedStatus:", selectedStatus);
        console.log("loadSmallPackages - page:", page, "offset:", offset);
        console.log("loadSmallPackages - clientUserId:", clientUserId);

        let result;

        // Si un filtre de statut est appliqué, utiliser getSmallPackages avec filtre
        if (selectedStatus !== "ALL") {
          result = await getSmallPackagesUsecase.execute({
            status: selectedStatus,
            limit,
            offset,
            clientUserId: clientUserId ? Number(clientUserId) : undefined,
          });
          console.log("loadSmallPackages - filtered result:", result);
          setSmallPackages(result.items);
          setTotal(result.total);
        } else {
          // Sinon, charger tous les colis de l'utilisateur
          result = await getSmallPackagesUsecase.execute({
            limit,
            offset,
            clientUserId: clientUserId ? Number(clientUserId) : undefined,
          });
          console.log("loadSmallPackages - get result:", result);
          console.log("loadSmallPackages - get result.items:", result.items);
          setSmallPackages(result.items);
          setTotal(result.total);
        }
        setCurrentPage(page);
        console.log(
          "loadSmallPackages - final items count:",
          result.items.length
        );
      } catch (error) {
        console.error("Erreur lors du chargement des petits colis:", error);
      } finally {
        setLoading(false);
      }
    },
    [selectedStatus, getSmallPackagesUsecase, limit, clientUserId]
  );

  const handleCreateInitialPackage = async (data: {
    trackingCode: string;
    deliveryModeId: string;
    packageName?: string;
  }) => {
    setIsCreatingPackage(true);
    try {
      // Vérifier que l'utilisateur est connecté
      if (!isAuthenticated || !clientUserId) {
        throw new Error("Vous devez être connecté pour créer un colis");
      }

      // Utiliser l'ID client depuis le hook
      await createInitialSmallPackageUsecase.execute({
        trackingCode: data.trackingCode,
        deliveryModeId: data.deliveryModeId,
        clientUserId: clientUserId || undefined,
        packageName: data.packageName,
      });

      // Recharger les données après la création
      await loadSmallPackages();
      // Mettre à jour le compteur de notifications non lues
      await refreshUnreadCount();
    } catch (error) {
      console.error("Erreur lors de la création du colis initial:", error);
      throw error;
    } finally {
      setIsCreatingPackage(false);
    }
  };

  useEffect(() => {
    loadSmallPackages(currentPage);
  }, [loadSmallPackages, currentPage]);

  // Effet pour recharger automatiquement quand on efface la recherche
  useEffect(() => {
    if (!searchTerm.trim()) {
      loadSmallPackages(1); // Recharger depuis la page 1
      setCurrentPage(1); // Remettre à la page 1
    }
  }, [searchTerm, loadSmallPackages]);

  // Effet pour recharger automatiquement quand on change le filtre de statut
  useEffect(() => {
    loadSmallPackages(1); // Recharger depuis la page 1
    setCurrentPage(1); // Remettre à la page 1
  }, [selectedStatus, loadSmallPackages]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadSmallPackages();
      return;
    }

    try {
      setLoading(true);
      // Pour les petits colis, inclure le statusId si un statut est sélectionné
      const statusId = selectedStatus !== "ALL" ? selectedStatus : undefined;
      const result = await searchSmallPackagesUsecase.execute(
        searchTerm,
        statusId,
        clientUserId ? Number(clientUserId) : undefined
      );
      setSmallPackages(result.items);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async (packageItem: SmallPackage) => {
    setSelectedPackageForHistory(packageItem);
    setIsHistoryModalOpen(true);
    try {
      await getPackageHistory(packageItem.id);
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
    }
  };

  const handleRenamePackage = async () => {
    if (!selectedPackageForRename || !newPackageName.trim()) return;

    setIsRenaming(true);
    try {
      await renamePackage(selectedPackageForRename.id, newPackageName.trim());
      // Recharger les colis après le renommage
      await loadSmallPackages();
      setIsRenameModalOpen(false);
      setSelectedPackageForRename(null);
      setNewPackageName("");
    } catch (error) {
      console.error("Erreur lors du renommage:", error);
    } finally {
      setIsRenaming(false);
    }
  };

  const openRenameModal = (packageItem: SmallPackage) => {
    setSelectedPackageForRename(packageItem);
    setNewPackageName(packageItem.packageName || "");
    setIsRenameModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "arrive_cn":
        return "bg-blue-100 text-blue-800";
      case "in_transit":
        return "bg-yellow-100 text-yellow-800";
      case "arrive_mg":
        return "bg-green-100 text-green-800";
      case "recuperated":
        return "bg-gray-100 text-gray-800";
      case "created":
        return "bg-purple-100 text-purple-800";
      case "returned":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    // Retourner le nom du statut tel quel depuis la base de données
    return status;
  };

  // Fonctions d'aide pour gérer les deux types de colis
  const getPackageName = (packageItem: Package | SmallPackage): string => {
    if ("customName" in packageItem) {
      return packageItem.customName || packageItem.trackingNumber;
    }
    return (
      (packageItem as SmallPackage).packageName ||
      (packageItem as SmallPackage).trackingCode
    );
  };

  const getTrackingCode = (packageItem: Package | SmallPackage): string => {
    if ("trackingNumber" in packageItem) {
      return packageItem.trackingNumber;
    }
    return (packageItem as SmallPackage).trackingCode;
  };

  const getPackageStatus = (packageItem: Package | SmallPackage): string => {
    console.log("getPackageStatus - packageItem:", packageItem);
    if ("status" in packageItem && typeof packageItem.status === "string") {
      return getStatusText(packageItem.status);
    }
    // Pour les SmallPackage avec objet status
    const smallPackage = packageItem as SmallPackage;
    if (smallPackage.status?.name) {
      console.log(
        "getPackageStatus - using status.name:",
        smallPackage.status.name
      );
      return getStatusText(smallPackage.status.name);
    }
    // Pour les SmallPackage, nous utilisons les propriétés calculées
    if (packageItem.isRecuperated) return "Récupéré";
    if (packageItem.hasArrived) return "Arrivé";
    if (packageItem.isInTransit) return "En transit";
    return "En attente";
  };

  const getPackageStatusColor = (
    packageItem: Package | SmallPackage
  ): string => {
    if ("status" in packageItem && typeof packageItem.status === "string") {
      return getStatusColor(packageItem.status);
    }
    // Pour les SmallPackage avec objet status ou propriétés calculées
    const smallPackage = packageItem as SmallPackage;
    if (smallPackage.status?.name) {
      return getStatusColor(smallPackage.status.name);
    }
    if (packageItem.isRecuperated) return "bg-gray-100 text-gray-800";
    if (packageItem.hasArrived) return "bg-green-100 text-green-800";
    if (packageItem.isInTransit) return "bg-yellow-100 text-yellow-800";
    return "bg-blue-100 text-blue-800";
  };

  const getShippingMode = (packageItem: Package | SmallPackage): string => {
    if ("shippingMode" in packageItem) {
      return packageItem.shippingMode;
    }
    // Pour SmallPackage, utiliser deliveryMode.mode si disponible
    const smallPackage = packageItem as SmallPackage;
    if (smallPackage.deliveryMode?.mode) {
      return smallPackage.deliveryMode.mode;
    }
    // Fallback sur deliveryModeId
    switch (packageItem.deliveryModeId) {
      case "1":
        return "Maritime";
      case "2":
        return "Aérien";
      case "3":
        return "Express";
      default:
        return "Non défini";
    }
  };

  return (
    <DashboardLayout title="Mes Colis" description="Gérez et suivez vos colis">
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
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0486e4] focus:border-[#0486e4] transition-colors text-black"
              >
                <option value="ALL">Tous les statuts</option>
                {statuses.map((status) => (
                  <option key={status.id} value={status.id.toString()}>
                    {status.name}
                  </option>
                ))}
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
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0486e4] focus:border-[#0486e4] transition-colors text-black"
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
          </div>

          {/* Bouton Créer un colis */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 bg-[#0486e4] text-white rounded-lg hover:bg-[#0369a1] focus:outline-none focus:ring-2 focus:ring-[#0486e4] focus:ring-offset-2 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Créer un colis</span>
            </button>
          </div>
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
        ) : smallPackages.length === 0 ? (
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
                <div className="col-span-3">Code de suivi</div>
                <div className="col-span-2">Actions</div>
              </div>
            </div>

            {/* Corps du tableau */}
            <div className="divide-y divide-gray-200">
              {smallPackages.map((packageItem, index) => (
                <div
                  key={
                    "id" in packageItem
                      ? packageItem.id
                      : (packageItem as SmallPackage).trackingCode
                  }
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
                        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getPackageStatusColor(
                          packageItem
                        )}`}
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
                      <span className="text-sm text-gray-500 font-mono">
                        {getTrackingCode(packageItem)}
                      </span>
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewHistory(packageItem)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          Historique
                        </button>
                        <button
                          onClick={() => openRenameModal(packageItem)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors"
                        >
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

      {/* Pagination */}
      {total > limit && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(Math.ceil(total / limit), p + 1)
                  )
                }
                disabled={currentPage === Math.ceil(total / limit)}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> sur{" "}
                  <span className="font-medium">
                    {Math.ceil(total / limit)}
                  </span>
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Précédent</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(Math.ceil(total / limit), p + 1)
                      )
                    }
                    disabled={currentPage === Math.ceil(total / limit)}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Suivant</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création de colis initial */}
      <CreateInitialPackageModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateInitialPackage}
        isLoading={isCreatingPackage}
      />

      {/* Modal d'historique du colis */}
      {isHistoryModalOpen && selectedPackageForHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Historique du colis
                </h3>
                <button
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Colis:</span>{" "}
                  {selectedPackageForHistory.packageName ||
                    selectedPackageForHistory.trackingCode}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Code de suivi:</span>{" "}
                  {selectedPackageForHistory.trackingCode}
                </p>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-96">
              {historyLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0486e4] border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600">
                    Chargement de l&apos;historique...
                  </p>
                </div>
              ) : history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-20 text-xs text-gray-500">
                        {new Date(entry.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {entry.action}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {entry.description}
                        </div>
                        {entry.user && (
                          <div className="text-xs text-gray-500 mt-2">
                            Par {entry.user.firstname} {entry.user.lastname}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Aucun historique disponible pour ce colis.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de renommage du colis */}
      {isRenameModalOpen && selectedPackageForRename && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Renommer le colis
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Code de suivi: {selectedPackageForRename.trackingCode}
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau nom du colis
                  </label>
                  <input
                    type="text"
                    value={newPackageName}
                    onChange={(e) => setNewPackageName(e.target.value)}
                    placeholder="Entrez le nouveau nom"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-[#0486e4] focus:border-[#0486e4]"
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleRenamePackage()
                    }
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsRenameModalOpen(false);
                  setSelectedPackageForRename(null);
                  setNewPackageName("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={isRenaming}
              >
                Annuler
              </button>
              <button
                onClick={handleRenamePackage}
                disabled={isRenaming || !newPackageName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-[#0486e4] rounded-md hover:bg-[#0369a1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isRenaming ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Renommage...
                  </>
                ) : (
                  "Renommer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
