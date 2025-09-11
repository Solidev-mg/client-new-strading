export interface Invoice {
  id: string;
  userId: string;
  containerNumber: string;
  packages: InvoicePackage[];
  subtotal: number;
  taxes: number;
  fees: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  delayPenalty?: number;
  notes?: string;
}

export interface InvoicePackage {
  packageId: string;
  trackingNumber: string;
  customName?: string;
  weight: number;
  shippingCost: number;
  serviceFee: number;
}

export enum InvoiceStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
  MOBILE_MONEY = "MOBILE_MONEY",
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export interface InvoiceFilter {
  status?: InvoiceStatus;
  dateFrom?: Date;
  dateTo?: Date;
  paymentMethod?: PaymentMethod;
}

export interface PaymentRequest {
  invoiceId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  paymentReference?: string;
  notes?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  message: string;
}
