"use client";

import {
  ArrowLeftRight,
  Bell,
  ChevronRight,
  FileText,
  Package,
  Settings,
} from "lucide-react";
import Link from "next/link";
import Header from "../components/Header";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";

export default function Dashboard() {
  const menuItems = [
    {
      title: "Mes Colis",
      description: "Suivez et gérez vos colis en temps réel",
      icon: <Package className="w-8 h-8" />,
      href: "/packages",
      color: "from-blue-500 to-blue-600",
      stats: "12 en cours",
    },
    {
      title: "Notifications",
      description: "Restez informé des derniers événements",
      icon: <Bell className="w-8 h-8" />,
      href: "/notifications",
      color: "from-yellow-500 to-orange-500",
      stats: "5 nouvelles",
    },
    {
      title: "Mes Factures",
      description: "Consultez et payez vos factures",
      icon: <FileText className="w-8 h-8" />,
      href: "/invoices",
      color: "from-green-500 to-emerald-500",
      stats: "3 impayées",
    },
    {
      title: "Transfert de Devises",
      description: "Effectuez des transferts RMB/USD sécurisés",
      icon: <ArrowLeftRight className="w-8 h-8" />,
      href: "/transfer",
      color: "from-purple-500 to-indigo-500",
      stats: "2 en cours",
    },
    {
      title: "Changement de Mode",
      description: "Modifiez le mode d'envoi de vos colis",
      icon: <Settings className="w-8 h-8" />,
      href: "/shipping-mode",
      color: "from-indigo-500 to-blue-600",
      stats: "Mode Express",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <Header />

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#0486e4] to-[#0369a1] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Bienvenue sur S-Trading</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Votre plateforme logistique complète pour gérer tous vos envois et
              transactions
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center" hover>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">12</div>
              <div className="text-sm text-gray-600">Colis en cours</div>
            </CardContent>
          </Card>

          <Card className="text-center" hover>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">3</div>
              <div className="text-sm text-gray-600">Factures impayées</div>
            </CardContent>
          </Card>

          <Card className="text-center" hover>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">5</div>
              <div className="text-sm text-gray-600">
                Nouvelles notifications
              </div>
            </CardContent>
          </Card>

          <Card className="text-center" hover>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ArrowLeftRight className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">2</div>
              <div className="text-sm text-gray-600">Transferts en cours</div>
            </CardContent>
          </Card>
        </div>

        {/* Services Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Services Disponibles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item, index) => (
              <Link key={index} href={item.href} className="block group">
                <Card className="h-full transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-14 h-14 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center text-white shadow-md`}
                      >
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-2 group-hover:text-[#0486e4] transition-colors">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="mb-3">
                          {item.description}
                        </CardDescription>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500">
                            {item.stats}
                          </span>
                          <div className="flex items-center text-[#0486e4] group-hover:translate-x-1 transition-transform">
                            <span className="text-sm font-medium mr-1">
                              Accéder
                            </span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
              <CardDescription>
                Accédez rapidement aux fonctions les plus utilisées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Nouveau Colis</Button>
                <Button variant="outline">Faire un Transfert</Button>
                <Button variant="secondary">Voir Notifications</Button>
                <Button variant="ghost">Aide & Support</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
