"use client";

interface TransferStatsProps {
  totalTransfers: number;
  completedTransfers: number;
  pendingTransfers: number;
  totalVolume: number;
}

export default function TransferStats({
  totalTransfers,
  completedTransfers,
  pendingTransfers,
  totalVolume,
}: TransferStatsProps) {
  const completionRate =
    totalTransfers > 0
      ? ((completedTransfers / totalTransfers) * 100).toFixed(1)
      : "0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total des transferts */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white transform hover:scale-105 transition-transform duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">
              Total Transferts
            </p>
            <p className="text-3xl font-bold">{totalTransfers}</p>
          </div>
          <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Transferts complétés */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white transform hover:scale-105 transition-transform duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium mb-1">Complétés</p>
            <p className="text-3xl font-bold">{completedTransfers}</p>
            <p className="text-xs text-green-100 mt-1">
              {completionRate}% de réussite
            </p>
          </div>
          <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Transferts en attente */}
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-md p-6 text-white transform hover:scale-105 transition-transform duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-100 text-sm font-medium mb-1">
              En Attente
            </p>
            <p className="text-3xl font-bold">{pendingTransfers}</p>
          </div>
          <div className="bg-yellow-400 bg-opacity-30 rounded-full p-3">
            <svg
              className="w-8 h-8 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Volume total */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white transform hover:scale-105 transition-transform duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium mb-1">
              Volume Total
            </p>
            <p className="text-2xl font-bold">
              {totalVolume.toLocaleString()} Ar
            </p>
          </div>
          <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
