import { CreateTransactionDto } from '../presentation/dto/create-transaction.dto'
import { Command } from '@nestjs/cqrs'
import type { TransactionResponse } from '../../../domain/types/transactions.type'

export class CreateTransactionCommand extends Command<TransactionResponse>  {
    constructor(
        public readonly dto: CreateTransactionDto
    ) {
        super()
    }
}
