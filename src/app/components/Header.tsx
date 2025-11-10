"use client";

import { useNotifications } from "@/contexts/NotificationContext";
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
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../modules/auth/presentation/providers/AuthProvider";

export default function Header() {
  const { authInfos, logout } = useAuth();
  const { unreadCount: notificationUnreadCount } = useNotifications();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const NotificationIcon = () => (
    <div className="relative">
      <Bell className="w-5 h-5" />
      {notificationUnreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {notificationUnreadCount > 99 ? "99+" : notificationUnreadCount}
        </span>
      )}
    </div>
  );

  const menuItems = [
    {
      title: "Mes Colis",
      href: "/packages",
      icon: <Package className="w-5 h-5" />,
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: <NotificationIcon />,
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
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center h-20 px-6 lg:px-8">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <a href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  S-Trading
                </span>
                <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase hidden sm:block">
                  Logistics Platform
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {menuItems.map((item, index) => {
              const active = isActive(item.href);
              return (
                <a
                  key={index}
                  href={item.href}
                  className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <div
                    className={`transition-transform duration-200 ${
                      active ? "" : "group-hover:scale-110"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span className="whitespace-nowrap">{item.title}</span>
                  {!active && (
                    <div className="absolute inset-x-2 bottom-1 h-0.5 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-5">
            {/* User Info */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="w-10 h-10 bg-gradient-to-br from-[#0486e4] to-[#0366c3] rounded-full flex items-center justify-center shadow-md">
                  <span className="text-sm font-bold text-white">
                    {authInfos?.firstName?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-gray-900 leading-none">
                    {authInfos?.firstName || "Utilisateur"}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5 leading-none">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    En ligne
                  </span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center space-x-2.5 px-5 py-3 bg-gradient-to-r from-gray-100 to-gray-200/50 hover:from-red-50 hover:to-red-100/50 text-gray-700 hover:text-red-600 rounded-xl transition-all duration-200 group border border-gray-200 hover:border-red-300 shadow-sm hover:shadow-md"
            >
              <LogOut className="w-4 h-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-200" />
              <span className="hidden sm:block font-semibold whitespace-nowrap">
                Déconnexion
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 transition-all duration-200 border border-gray-200 hover:border-blue-300"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 transition-transform duration-200 rotate-90" />
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
            ? "max-h-[600px] opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <nav className="px-4 py-4 space-y-1.5">
          {menuItems.map((item, index) => {
            const active = isActive(item.href);
            return (
              <a
                key={index}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                <span className="font-semibold whitespace-nowrap">
                  {item.title}
                </span>
                {item.title === "Notifications" &&
                  notificationUnreadCount > 0 && (
                    <span
                      className={`ml-auto text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-2 shadow-md ${
                        active
                          ? "bg-white text-[#0486e4]"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {notificationUnreadCount > 99
                        ? "99+"
                        : notificationUnreadCount}
                    </span>
                  )}
              </a>
            );
          })}

          {/* Mobile User Info */}
          <div className="md:hidden mt-5 pt-5 border-t border-gray-200">
            <div className="flex items-center space-x-4 px-5 py-3.5 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-200/50 shadow-sm">
              <div className="w-11 h-11 bg-gradient-to-br from-[#0486e4] to-[#0366c3] rounded-full flex items-center justify-center shadow-md">
                <span className="text-sm font-bold text-white">
                  {authInfos?.firstName?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-gray-900 leading-none">
                  {authInfos?.firstName || "Utilisateur"}
                </span>
                <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5 leading-none">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  En ligne
                </span>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
