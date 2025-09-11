import {
  CreatePackageRequest,
  Package,
  PackageFilter,
  UpdatePackageRequest,
} from "../entities/package.entity";

export interface PackageRepository {
  getPackages(filter?: PackageFilter): Promise<Package[]>;
  getPackageById(id: string): Promise<Package | null>;
  getPackageByTrackingNumber(trackingNumber: string): Promise<Package | null>;
  createPackage(packageData: CreatePackageRequest): Promise<Package>;
  updatePackage(id: string, updates: UpdatePackageRequest): Promise<Package>;
  deletePackage(id: string): Promise<boolean>;
  getPackageHistory(packageId: string): Promise<Package>;
}
