"use client";

import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "yellow" | "purple" | "red" | "indigo";
  className?: string;
}

const colorClasses = {
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    text: "text-blue-600",
  },
  green: {
    bg: "bg-green-50",
    icon: "text-green-600",
    text: "text-green-600",
  },
  yellow: {
    bg: "bg-yellow-50",
    icon: "text-yellow-600",
    text: "text-yellow-600",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
    text: "text-purple-600",
  },
  red: {
    bg: "bg-red-50",
    icon: "text-red-600",
    text: "text-red-600",
  },
  indigo: {
    bg: "bg-indigo-50",
    icon: "text-indigo-600",
    text: "text-indigo-600",
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "blue",
  className = "",
}: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div
      className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  trend.isPositive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <svg
                  className={`w-3 h-3 mr-1 ${
                    trend.isPositive ? "rotate-0" : "rotate-180"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 14l9-9 9 9"
                  />
                </svg>
                {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div
            className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center ${colors.icon}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
