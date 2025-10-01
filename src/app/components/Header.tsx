"use client";

import {
  ArrowLeftRight,
  Bell,
  FileText,
  LogOut,
  Menu,
  Package,
  Settings,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../modules/auth/presentation/providers/AuthProvider";

interface MenuItem {
  title: string;
  href: string;
  icon: React.JSX.Element;
}

export default function Header() {
  const { authInfos, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems: MenuItem[] = [
    {
      title: "Mes Colis",
      href: "/packages",
      icon: <Package className="w-5 h-5" />,
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: <Bell className="w-5 h-5" />,
    },
    {
      title: "Mes Factures",
      href: "/invoices",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      title: "Transfert",
      href: "/transfer",
      icon: <ArrowLeftRight className="w-5 h-5" />,
    },
    {
      title: "Mode d'envoi",
      href: "/shipping-mode",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Main Header */}
      <header className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="flex items-center space-x-3 group"
              >
                <div className="relative">
                  <Image
                    src="/strading_icon.png"
                    alt="S-Trading Logo"
                    width={40}
                    height={40}
                    className="rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-900 group-hover:text-[#0486e4] transition-colors">
                    S-Trading
                  </span>
                  <span className="text-xs text-gray-500 hidden sm:block">
                    Logistics Platform
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="group flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-[#0486e4] hover:bg-[#0486e4]/5 transition-all duration-200 relative overflow-hidden"
                >
                  <div className="group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </div>
                  <span>{item.title}</span>
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#0486e4] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-[#0486e4] rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {authInfos?.firstName?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {authInfos?.firstName || "Utilisateur"}
                    </span>
                    <span className="text-xs text-gray-500">En ligne</span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-lg transition-all duration-200 group"
              >
                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:block">Déconnexion</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 transition-transform duration-200" />
                ) : (
                  <Menu className="w-6 h-6 transition-transform duration-200" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`lg:hidden bg-white border-t border-gray-100 transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <nav className="px-4 py-2 space-y-1">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:text-[#0486e4] hover:bg-[#0486e4]/5 transition-all duration-200"
              >
                {item.icon}
                <span className="font-medium">{item.title}</span>
              </Link>
            ))}

            {/* Mobile User Info */}
            <div className="md:hidden mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-3 px-4 py-2">
                <div className="w-10 h-10 bg-[#0486e4] rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {authInfos?.firstName?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {authInfos?.firstName || "Utilisateur"}
                  </span>
                  <span className="text-xs text-gray-500">En ligne</span>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
