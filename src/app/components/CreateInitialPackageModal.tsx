"use client";

import { DeliveryMode } from "@/app/modules/package/domain/entities/small-package.entity";
import { ApiSmallPackageRepository } from "@/app/modules/package/infrastructure/gateway/api.small-package.repository";
import { X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface CreateInitialPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    trackingCode: string;
    deliveryModeId: string;
    packageName?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export default function CreateInitialPackageModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateInitialPackageModalProps) {
  const [trackingCode, setTrackingCode] = useState("");
  const [deliveryModeId, setDeliveryModeId] = useState(DeliveryMode.NORMAL);
  const [packageName, setPackageName] = useState("");
  const [error, setError] = useState("");
  const [trackingCodeExists, setTrackingCodeExists] = useState(false);
  const [checkingTrackingCode, setCheckingTrackingCode] = useState(false);

  const repository = useMemo(() => new ApiSmallPackageRepository(), []);

  // Vérifier l'existence du tracking code avec debounce
  const checkTrackingCode = useCallback(
    async (code: string) => {
      if (code.trim().length === 0) {
        setTrackingCodeExists(false);
        return;
      }

      setCheckingTrackingCode(true);
      try {
        const exists = await repository.checkTrackingCodeExists(code.trim());
        setTrackingCodeExists(exists);
      } catch (error) {
        console.error(
          "Erreur lors de la vérification du code de suivi:",
          error
        );
      } finally {
        setCheckingTrackingCode(false);
      }
    },
    [repository]
  );

  // Vérifier le tracking code après un délai
  useEffect(() => {
    const timer = setTimeout(() => {
      if (trackingCode.trim()) {
        checkTrackingCode(trackingCode);
      } else {
        setTrackingCodeExists(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [trackingCode, checkTrackingCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!trackingCode.trim()) {
      setError("Le code de suivi est requis");
      return;
    }

    if (trackingCodeExists) {
      setError("Ce code de suivi existe déjà dans le système");
      return;
    }

    try {
      const payload: {
        trackingCode: string;
        deliveryModeId: string;
        packageName?: string;
      } = {
        trackingCode: trackingCode.trim(),
        deliveryModeId,
      };

      if (packageName.trim()) {
        payload.packageName = packageName.trim();
      }

      await onSubmit(payload);

      // Reset form
      setTrackingCode("");
      setDeliveryModeId(DeliveryMode.NORMAL);
      setPackageName("");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la création du colis"
      );
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTrackingCode("");
      setDeliveryModeId(DeliveryMode.NORMAL);
      setPackageName("");
      setError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-400 bg-opacity-10 backdrop-blur-lg flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Créer un nouveau colis
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Tracking Code */}
          <div className="mb-4">
            <label
              htmlFor="trackingCode"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Code de suivi *
            </label>
            <div className="relative">
              <input
                type="text"
                id="trackingCode"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Ex: SP20240913143025001"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  trackingCodeExists
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : trackingCode.trim() && !checkingTrackingCode
                    ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                    : "border-gray-300 focus:ring-[#0486e4] focus:border-[#0486e4]"
                } text-gray-600`}
                disabled={isLoading}
                required
              />
              {checkingTrackingCode && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-[#0486e4]"></div>
                </div>
              )}
              {trackingCode.trim() && !checkingTrackingCode && (
                <div
                  className={`absolute right-3 top-3 text-sm ${
                    trackingCodeExists ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {trackingCodeExists ? "✕" : "✓"}
                </div>
              )}
            </div>
            {trackingCodeExists ? (
              <p className="mt-1 text-xs text-red-600">
                ⚠️ Ce code de suivi existe déjà dans le système
              </p>
            ) : trackingCode.trim() && !checkingTrackingCode ? (
              <p className="mt-1 text-xs text-green-600">
                ✓ Code de suivi disponible
              </p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                Entrez le code de suivi fourni par votre transporteur
              </p>
            )}
          </div>

          {/* Delivery Mode */}
          <div className="mb-4">
            <label
              htmlFor="deliveryMode"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mode de livraison *
            </label>
            <select
              id="deliveryMode"
              value={deliveryModeId}
              onChange={(e) =>
                setDeliveryModeId(e.target.value as DeliveryMode)
              }
              className="w-full px-4 py-2.5 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0486e4] focus:border-[#0486e4] transition-colors"
              disabled={isLoading}
              required
            >
              <option value={DeliveryMode.NORMAL}>Normal</option>
              <option value={DeliveryMode.EXPRESS}>Express</option>
              <option value={DeliveryMode.BATTERIE}>Batterie</option>
              <option value={DeliveryMode.MARITIME}>Maritime</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Sélectionnez le mode de transport souhaité
            </p>
          </div>

          {/* Package Name */}
          <div className="mb-6">
            <label
              htmlFor="packageName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nom du colis
            </label>
            <input
              type="text"
              id="packageName"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="Ex: Chaussures"
              className="w-full px-4 py-2.5 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0486e4] focus:border-[#0486e4] transition-colors"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Description du contenu du colis (optionnel)
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0486e4] border border-transparent rounded-md hover:bg-[#0369a1] focus:outline-none focus:ring-2 focus:ring-[#0486e4] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Création...
                </div>
              ) : (
                "Créer le colis"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
