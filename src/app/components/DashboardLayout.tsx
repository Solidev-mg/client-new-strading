"use client";

import React from "react";
import Breadcrumb from "./Breadcrumb";
import Header from "./Header";
import PageHeader from "./PageHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  showBreadcrumb?: boolean;
}

export default function DashboardLayout({
  children,
  title,
  description,
  action,
  showBreadcrumb = true,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <Header />

      {/* Breadcrumb Navigation */}
      {showBreadcrumb && <Breadcrumb />}

      {/* Page Header */}
      <PageHeader title={title} description={description} action={action} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
