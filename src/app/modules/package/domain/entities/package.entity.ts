export interface Package {
  id: string;
  trackingNumber: string;
  customName?: string;
  status: PackageStatus;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  description?: string;
  value?: number;
  currency?: string;
  shippingMode: ShippingMode;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  history: PackageHistoryEntry[];
}

export enum PackageStatus {
  RECEIVED_IN_CHINA = "RECEIVED_IN_CHINA",
  IN_TRANSIT = "IN_TRANSIT",
  ARRIVED_IN_MADAGASCAR = "ARRIVED_IN_MADAGASCAR",
  RETRIEVED = "RETRIEVED",
  SHIPPING_MODE_CHANGED = "SHIPPING_MODE_CHANGED",
}

export enum ShippingMode {
  SEA = "SEA",
  AIR = "AIR",
  EXPRESS = "EXPRESS",
}

export interface PackageHistoryEntry {
  id: string;
  packageId: string;
  status: PackageStatus;
  description: string;
  location?: string;
  timestamp: Date;
  createdBy?: string;
}

export interface PackageFilter {
  status?: PackageStatus;
  searchTerm?: string;
  dateFrom?: Date;
  dateTo?: Date;
  shippingMode?: ShippingMode;
}

export interface UpdatePackageRequest {
  customName?: string;
  shippingMode?: ShippingMode;
}

export interface CreatePackageRequest {
  trackingNumber: string;
  customName?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  description?: string;
  value?: number;
  currency?: string;
  shippingMode: ShippingMode;
}
