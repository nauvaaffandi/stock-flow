import { CreateTransactionDto } from '../presentation/dto/create-transaction.dto'
import { Command } from '@nestjs/cqrs'
import type { TransactionContract } from '../../../domain/types/transactions.type'

export class CreateTransactionCommand extends Command<TransactionContract>  {
    constructor(
        public readonly dto: CreateTransactionDto
    ) {
        super()
    }
}
