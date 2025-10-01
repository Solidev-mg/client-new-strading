export interface SmallPackage {
  id: string;
  clientUserId: string | null;
  deliveryModeId: string;
  bigPackageId: string | null;
  trackingCode: string;
  receptionDate: Date | null;
  packageName: string | null;
  statusId: string | null;
  weight: number | null;
  volume: number | null;
  packageFee: number | null;
  recuperationDate: Date | null;
  departureTime: Date | null;
  arrivalTime: Date | null;
  containerId: string | null;
  originalDeliveryModeId: string | null;
  localFee: number | null;
  comments: string | null;
  picture: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Propriétés calculées
  isRecuperated: boolean;
  isInTransit: boolean;
  hasArrived: boolean;
  transitDurationInHours: number | null;
  formattedWeight: string;
  formattedVolume: string;
  formattedPackageFee: string;
}

export interface CreateInitialSmallPackageRequest {
  trackingCode: string;
  deliveryModeId: string;
  clientUserId?: string;
}

export interface SmallPackageFilter {
  status?: string;
  searchTerm?: string;
  dateFrom?: Date;
  dateTo?: Date;
  deliveryModeId?: string;
  clientUserId?: string;
  limit?: number;
  offset?: number;
}

export interface SmallPackagePaginatedResponse {
  items: SmallPackage[];
  total: number;
  limit: number;
  offset: number;
}

export enum SmallPackageStatus {
  PENDING = "PENDING",
  RECEIVED = "RECEIVED",
  IN_TRANSIT = "IN_TRANSIT",
  ARRIVED = "ARRIVED",
  PICKED_UP = "PICKED_UP",
}

export enum DeliveryMode {
  NORMAL = "1",
  EXPRESS = "2",
  BATTERIE = "3",
  MARITIME = "4",
}
