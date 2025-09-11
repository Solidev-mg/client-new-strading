import {
  Invoice,
  InvoiceFilter,
  PaymentRequest,
  PaymentResponse,
} from "../entities/invoice.entity";

export interface InvoiceRepository {
  getInvoices(filter?: InvoiceFilter): Promise<Invoice[]>;
  getInvoiceById(id: string): Promise<Invoice | null>;
  payInvoice(paymentRequest: PaymentRequest): Promise<PaymentResponse>;
  downloadInvoice(id: string): Promise<Blob>;
  getPaymentHistory(userId: string): Promise<Invoice[]>;
}
