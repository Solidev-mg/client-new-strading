import {
  Invoice,
  InvoiceFilter,
  PaymentRequest,
  PaymentResponse,
} from "../entities/invoice.entity";
import { InvoiceRepository } from "../repositories/invoice.repository";

export class GetInvoicesUsecase {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(filter?: InvoiceFilter): Promise<Invoice[]> {
    return this.invoiceRepository.getInvoices(filter);
  }
}

export class GetInvoiceByIdUsecase {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(id: string): Promise<Invoice | null> {
    return this.invoiceRepository.getInvoiceById(id);
  }
}

export class PayInvoiceUsecase {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    return this.invoiceRepository.payInvoice(paymentRequest);
  }
}

export class DownloadInvoiceUsecase {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(id: string): Promise<Blob> {
    return this.invoiceRepository.downloadInvoice(id);
  }
}

export class GetPaymentHistoryUsecase {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(userId: string): Promise<Invoice[]> {
    return this.invoiceRepository.getPaymentHistory(userId);
  }
}
