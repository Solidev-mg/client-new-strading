// Export des services principaux
export { AuthService } from "./auth.service";
export { DelayPricingService } from "./delay-pricing.service";
export { ExchangeRateService } from "./exchange-rate.service";
export { InvoiceService } from "./invoice.service";
export { PackageHistoryService } from "./package-history.service";
export { PaymentService } from "./payment.service";
export { ReferenceDataService } from "./reference-data.service";
export { SmallPackageService } from "./small-package.service";
export { UserService } from "./user.service";

// Export des types
export type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  UserProfile,
} from "./auth.service";

export type {
  CreateAdminRequest,
  CreateClientRequest,
  User,
} from "./user.service";

export type {
  CreateSmallPackageRequest,
  PackageHistory,
  RenamePackageRequest,
  SearchSmallPackageParams,
  SearchSmallPackageResponse,
  SmallPackage,
} from "./small-package.service";

export type {
  CreateDeliveryModeRequest,
  CreateStatusRequest,
  DeliveryMode,
  Status,
} from "./reference-data.service";

export type {
  CreateInvoiceRequest,
  Invoice,
  InvoiceDetail,
  InvoicePaginatedResponse,
} from "./invoice.service";

export type {
  CreatePaymentRequest,
  Payment,
  PaymentPaginatedResponse,
} from "./payment.service";

export type {
  CreateDelayPricingRequest,
  DelayPricing,
  DelayPricingPaginatedResponse,
} from "./delay-pricing.service";

export type {
  CreateExchangeRateRequest,
  ExchangeRate,
  ExchangeRatePaginatedResponse,
} from "./exchange-rate.service";

// Export du client API
export { API_BASE_URL, default as apiClient } from "./api";
