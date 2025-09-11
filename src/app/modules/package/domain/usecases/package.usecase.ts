import {
  CreatePackageRequest,
  Package,
  PackageFilter,
  UpdatePackageRequest,
} from "../entities/package.entity";
import { PackageRepository } from "../repositories/package.repository";

export class GetPackagesUsecase {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(filter?: PackageFilter): Promise<Package[]> {
    return this.packageRepository.getPackages(filter);
  }
}

export class GetPackageByIdUsecase {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(id: string): Promise<Package | null> {
    return this.packageRepository.getPackageById(id);
  }
}

export class GetPackageByTrackingNumberUsecase {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(trackingNumber: string): Promise<Package | null> {
    return this.packageRepository.getPackageByTrackingNumber(trackingNumber);
  }
}

export class CreatePackageUsecase {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(packageData: CreatePackageRequest): Promise<Package> {
    return this.packageRepository.createPackage(packageData);
  }
}

export class UpdatePackageUsecase {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(id: string, updates: UpdatePackageRequest): Promise<Package> {
    return this.packageRepository.updatePackage(id, updates);
  }
}

export class GetPackageHistoryUsecase {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(packageId: string): Promise<Package> {
    return this.packageRepository.getPackageHistory(packageId);
  }
}

export class SearchPackagesUsecase {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(searchTerm: string): Promise<Package[]> {
    return this.packageRepository.getPackages({
      searchTerm,
    });
  }
}
