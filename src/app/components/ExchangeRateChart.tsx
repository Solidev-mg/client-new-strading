"use client";

import { ExchangeRate } from "@/services/exchange-rate.service";
import { useMemo } from "react";

interface ExchangeRateChartProps {
  rates: ExchangeRate[];
  currency: "USD" | "CNY";
}

export default function ExchangeRateChart({
  rates,
  currency,
}: ExchangeRateChartProps) {
  const chartData = useMemo(() => {
    if (!rates.length) return { min: 0, max: 0, points: [] };

    const values = rates.map((r) => r.rate);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    const points = rates.map((rate, index) => ({
      x: (index / (rates.length - 1)) * 100,
      y: ((rate.rate - min) / (range || 1)) * 100,
      rate: rate.rate,
      date: new Date(rate.createdAt),
    }));

    return { min, max, points };
  }, [rates]);

  if (!rates.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        <p>Aucune donnée disponible</p>
      </div>
    );
  }

  const pathData = chartData.points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${point.x} ${100 - point.y}`;
    })
    .join(" ");

  const areaData = `${pathData} L 100 100 L 0 100 Z`;

  const currentRate = rates[0]?.rate || 0;
  const oldestRate = rates[rates.length - 1]?.rate || 0;
  const change = currentRate - oldestRate;
  const changePercent = ((change / oldestRate) * 100).toFixed(2);

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-600">
            Taux de change {currency}/MGA
          </h3>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-gray-900">
              {currentRate.toLocaleString()} Ar
            </span>
            <span
              className={`text-sm font-medium ${
                change >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {change >= 0 ? "↑" : "↓"} {Math.abs(change).toFixed(2)} (
              {changePercent}%)
            </span>
          </div>
        </div>
        <div className="text-right text-xs text-gray-500">
          <div>Min: {chartData.min.toLocaleString()} Ar</div>
          <div>Max: {chartData.max.toLocaleString()} Ar</div>
        </div>
      </div>

      {/* Graphique SVG */}
      <div className="relative h-48 bg-gradient-to-b from-blue-50 to-white rounded-lg border border-gray-200 overflow-hidden">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
        >
          {/* Grille de fond */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
            </linearGradient>
          </defs>

          {/* Lignes de grille horizontales */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="0.2"
              strokeDasharray="1,1"
            />
          ))}

          {/* Zone sous la courbe */}
          <path d={areaData} fill="url(#gradient)" />

          {/* Ligne de la courbe */}
          <path
            d={pathData}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points de données */}
          {chartData.points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={100 - point.y}
                r="1"
                fill="rgb(37, 99, 235)"
                className="hover:r-2 transition-all cursor-pointer"
              />
            </g>
          ))}
        </svg>

        {/* Tooltips au survol */}
        <div className="absolute inset-0 flex items-end justify-between px-4 pb-2 pointer-events-none">
          {chartData.points.slice(0, 5).map((point, index) => (
            <div
              key={index}
              className="text-xs text-gray-500"
              style={{ fontSize: "0.6rem" }}
            >
              {point.date.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "short",
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Taux actuel</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-0.5 bg-blue-300"></div>
          <span>Évolution</span>
        </div>
      </div>
    </div>
  );
}
