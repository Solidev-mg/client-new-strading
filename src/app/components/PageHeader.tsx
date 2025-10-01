"use client";

import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  action,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
                {title}
              </h1>
              {description && (
                <p className="mt-1 text-sm text-gray-500 max-w-2xl">
                  {description}
                </p>
              )}
            </div>

            {action && (
              <div className="mt-4 flex md:ml-4 md:mt-0">{action}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
