"use client";

import Link from "next/link";
import { useAuth } from "../modules/auth/presentation/providers/AuthProvider";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function DashboardLayout({
  children,
  title,
  description,
}: DashboardLayoutProps) {
  const { authInfos, logout } = useAuth();

  const menuItems = [
    {
      title: "Mes Colis",
      href: "/packages",
      icon: "📦",
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: "🔔",
    },
    {
      title: "Mes Factures",
      href: "/invoices",
      icon: "💰",
    },
    {
      title: "Transfert",
      href: "/transfer",
      icon: "💸",
    },
    {
      title: "Mode d'envoi",
      href: "/shipping-mode",
      icon: "🚚",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0486e4] text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link
                href="/dashboard"
                className="text-2xl font-bold hover:text-gray-200"
              >
                Strading
              </Link>

              {/* Navigation Menu */}
              <nav className="hidden md:flex space-x-6">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    <span>{item.icon}</span>
                    <span>{item.title}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm">
                Bienvenue, {authInfos?.firstName || "Utilisateur"}
              </span>
              <button
                onClick={logout}
                className="bg-white text-[#0486e4] px-4 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-[#0486e4] border-t border-blue-600">
        <div className="container mx-auto px-4">
          <nav className="flex overflow-x-auto py-2 space-x-4">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors whitespace-nowrap"
              >
                <span>{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Page Title */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {description && (
                <p className="mt-1 text-gray-600">{description}</p>
              )}
            </div>
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Retour au dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
