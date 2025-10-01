import {
  CreateInitialSmallPackageRequest,
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
  createInitialSmallPackage(
    packageData: CreateInitialSmallPackageRequest
  ): Promise<SmallPackage>;
  getSmallPackageHistory(packageId: string): Promise<SmallPackage>;
}
