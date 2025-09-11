"use client";

import Link from "next/link";
import { useAuth } from "../modules/auth/presentation/providers/AuthProvider";

export default function Dashboard() {
  const { authInfos, logout } = useAuth();

  const menuItems = [
    {
      title: "Mes Colis",
      description: "Suivez et gérez vos colis",
      icon: "📦",
      href: "/packages",
      color: "bg-blue-500",
    },
    {
      title: "Notifications",
      description: "Restez informé des événements",
      icon: "🔔",
      href: "/notifications",
      color: "bg-yellow-500",
    },
    {
      title: "Mes Factures",
      description: "Consultez et payez vos factures",
      icon: "💰",
      href: "/invoices",
      color: "bg-green-500",
    },
    {
      title: "Transfert de Devises",
      description: "Effectuez des transferts RMB/USD",
      icon: "💸",
      href: "/transfer",
      color: "bg-purple-500",
    },
    {
      title: "Changement de Mode",
      description: "Modifiez le mode d'envoi de vos colis",
      icon: "🚚",
      href: "/shipping-mode",
      color: "bg-indigo-500",
    },
  ];

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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de bord
          </h2>
          <p className="text-gray-600">
            Accédez à toutes vos fonctionnalités Strading
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Link key={index} href={item.href}>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500">
                <div className="flex items-center mb-4">
                  <div
                    className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center text-white text-xl mr-4`}
                  >
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {item.title}
                  </h3>
                </div>
                <p className="text-gray-600">{item.description}</p>
                <div className="mt-4 flex items-center text-blue-600">
                  <span className="text-sm font-medium">Accéder</span>
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Statistiques rapides */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-blue-600">12</div>
            <div className="text-gray-600">Colis en cours</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-green-600">3</div>
            <div className="text-gray-600">Factures impayées</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-yellow-600">5</div>
            <div className="text-gray-600">Notifications</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-purple-600">2</div>
            <div className="text-gray-600">Transferts en cours</div>
          </div>
        </div>
      </main>
    </div>
  );
}
