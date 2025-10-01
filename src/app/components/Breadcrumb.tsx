"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const paths = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Dashboard", href: "/dashboard" },
    ];

    const pathLabels: Record<string, string> = {
      packages: "Mes Colis",
      notifications: "Notifications",
      invoices: "Mes Factures",
      transfer: "Transfert",
      "shipping-mode": "Mode d'envoi",
    };

    paths.forEach((path, index) => {
      if (path !== "dashboard") {
        const label =
          pathLabels[path] || path.charAt(0).toUpperCase() + path.slice(1);
        const href =
          index === paths.length - 1
            ? undefined
            : `/${paths.slice(0, index + 1).join("/")}`;
        breadcrumbs.push({ label, href });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 py-3">
          <svg
            className="w-4 h-4 text-gray-400"
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

          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center space-x-2">
                {index > 0 && (
                  <svg
                    className="w-4 h-4 text-gray-400"
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
                )}

                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-gray-600 hover:text-[#0486e4] font-medium transition-colors duration-200"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 font-semibold">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </nav>
  );
}
