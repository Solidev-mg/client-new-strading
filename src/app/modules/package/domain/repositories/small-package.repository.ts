import {
  CreateInitialSmallPackageRequest,
  PackageHistory,
  SmallPackage,
  SmallPackageFilter,
  SmallPackagePaginatedResponse,
} from "../entities/small-package.entity";

export interface SmallPackageRepository {
  getSmallPackages(
    filter?: SmallPackageFilter
  ): Promise<SmallPackagePaginatedResponse>;
  getSmallPackageById(id: string): Promise<SmallPackage | null>;
  getSmallPackageByTrackingCode(
    trackingCode: string
  ): Promise<SmallPackage | null>;
  checkTrackingCodeExists(trackingCode: string): Promise<boolean>;
  createInitialSmallPackage(
    packageData: CreateInitialSmallPackageRequest
  ): Promise<SmallPackage>;
  getSmallPackageHistory(packageId: string): Promise<SmallPackage>;
  searchSmallPackages(params: {
    trackingCode?: string;
    packageName?: string;
    clientCode?: string;
    statusId?: string;
    page?: number;
    limit?: number;
  }): Promise<SmallPackagePaginatedResponse>;
  changeDeliveryMode(
    packageId: string,
    newDeliveryModeId: string
  ): Promise<SmallPackage>;
  renamePackage(packageId: string, newName: string): Promise<SmallPackage>;
  getPackageHistoryById(packageId: string): Promise<PackageHistory[]>;
}
