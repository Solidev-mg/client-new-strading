import { TransferRepository } from "./domain/repositories/transfer.repository";
import { ApiTransferRepository } from "./infrastructure/gateway/api.transfer.repository";

export const transferRepository: TransferRepository =
  new ApiTransferRepository();

export * from "./domain/entities/transfer.entity";
export * from "./domain/repositories/transfer.repository";
