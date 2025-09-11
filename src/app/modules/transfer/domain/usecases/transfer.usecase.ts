import {
  ChatMessage,
  CreateTransferRequest,
  Currency,
  ExchangeRate,
  SendChatMessageRequest,
  Transfer,
} from "../entities/transfer.entity";
import { TransferRepository } from "../repositories/transfer.repository";

export class GetTransfersUsecase {
  constructor(private readonly transferRepository: TransferRepository) {}

  async execute(): Promise<Transfer[]> {
    return this.transferRepository.getTransfers();
  }
}

export class GetTransferByIdUsecase {
  constructor(private readonly transferRepository: TransferRepository) {}

  async execute(id: string): Promise<Transfer | null> {
    return this.transferRepository.getTransferById(id);
  }
}

export class CreateTransferUsecase {
  constructor(private readonly transferRepository: TransferRepository) {}

  async execute(transferData: CreateTransferRequest): Promise<Transfer> {
    return this.transferRepository.createTransfer(transferData);
  }
}

export class GetExchangeRatesUsecase {
  constructor(private readonly transferRepository: TransferRepository) {}

  async execute(): Promise<ExchangeRate[]> {
    return this.transferRepository.getExchangeRates();
  }
}

export class GetExchangeRateUsecase {
  constructor(private readonly transferRepository: TransferRepository) {}

  async execute(
    fromCurrency: Currency,
    toCurrency: Currency
  ): Promise<ExchangeRate> {
    return this.transferRepository.getExchangeRate(fromCurrency, toCurrency);
  }
}

export class SendChatMessageUsecase {
  constructor(private readonly transferRepository: TransferRepository) {}

  async execute(messageData: SendChatMessageRequest): Promise<ChatMessage> {
    return this.transferRepository.sendChatMessage(messageData);
  }
}

export class GetChatMessagesUsecase {
  constructor(private readonly transferRepository: TransferRepository) {}

  async execute(transferId: string): Promise<ChatMessage[]> {
    return this.transferRepository.getChatMessages(transferId);
  }
}

export class UploadPaymentProofUsecase {
  constructor(private readonly transferRepository: TransferRepository) {}

  async execute(transferId: string, file: File): Promise<boolean> {
    return this.transferRepository.uploadPaymentProof(transferId, file);
  }
}
