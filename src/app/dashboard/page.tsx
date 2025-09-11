"use client";

import { useAuth } from "../modules/auth/presentation/providers/AuthProvider";

export default function Dashboard() {
  const { authInfos, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#0486e4] text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard - Strading</h1>
          <div className="flex items-center gap-4">
            <span>Bienvenue, {authInfos?.firstName || "Utilisateur"}</span>
            <button
              onClick={logout}
              className="bg-white text-[#0486e4] px-4 py-2 rounded hover:bg-gray-100 transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-[#0486e4] mb-4">
              Statistiques
            </h2>
            <p className="text-gray-600">
              Consultez vos statistiques de trading
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-[#0486e4] mb-4">
              Portefeuille
            </h2>
            <p className="text-gray-600">
              Gérez votre portefeuille d&apos;investissements
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-[#0486e4] mb-4">
              Analyses
            </h2>
            <p className="text-gray-600">Accédez aux analyses de marché</p>
          </div>
        </div>
      </main>
    </div>
  );
}
