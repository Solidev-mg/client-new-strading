import {
  CreateInitialSmallPackageRequest,
  SmallPackage,
  SmallPackageFilter,
  SmallPackagePaginatedResponse,
} from "../entities/small-package.entity";
import { SmallPackageRepository } from "../repositories/small-package.repository";

export class GetSmallPackagesUsecase {
  constructor(
    private readonly smallPackageRepository: SmallPackageRepository
  ) {}

  async execute(
    filter?: SmallPackageFilter
  ): Promise<SmallPackagePaginatedResponse> {
    return this.smallPackageRepository.getSmallPackages(filter);
  }
}

export class GetSmallPackageByIdUsecase {
  constructor(
    private readonly smallPackageRepository: SmallPackageRepository
  ) {}

  async execute(id: string): Promise<SmallPackage | null> {
    return this.smallPackageRepository.getSmallPackageById(id);
  }
}

export class GetSmallPackageByTrackingCodeUsecase {
  constructor(
    private readonly smallPackageRepository: SmallPackageRepository
  ) {}

  async execute(trackingCode: string): Promise<SmallPackage | null> {
    return this.smallPackageRepository.getSmallPackageByTrackingCode(
      trackingCode
    );
  }
}

export class CreateInitialSmallPackageUsecase {
  constructor(
    private readonly smallPackageRepository: SmallPackageRepository
  ) {}

  async execute(
    packageData: CreateInitialSmallPackageRequest
  ): Promise<SmallPackage> {
    return this.smallPackageRepository.createInitialSmallPackage(packageData);
  }
}

export class GetSmallPackageHistoryUsecase {
  constructor(
    private readonly smallPackageRepository: SmallPackageRepository
  ) {}

  async execute(packageId: string): Promise<SmallPackage> {
    return this.smallPackageRepository.getSmallPackageHistory(packageId);
  }
}

export class SearchSmallPackagesUsecase {
  constructor(
    private readonly smallPackageRepository: SmallPackageRepository
  ) {}

  async execute(
    searchTerm: string,
    statusId?: string
  ): Promise<SmallPackagePaginatedResponse> {
    // Utiliser la vraie méthode de recherche avec trackingCode et statusId
    const params: {
      trackingCode?: string;
      statusId?: string;
      page: number;
      limit: number;
    } = {
      page: 1,
      limit: 50,
    };

    if (searchTerm) {
      params.trackingCode = searchTerm;
    }

    if (statusId) {
      params.statusId = statusId;
    }

    return this.smallPackageRepository.searchSmallPackages(params);
  }
}
