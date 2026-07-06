import { CreateTransactionDto } from '../presentation/dto/create-transaction.dto'
import { Command } from '@nestjs/cqrs'
import type { Transaction } from '../../../domain/types/transactions.type'

export class CreateTransactionCommand extends Command<Transaction>  {
    constructor(
        public readonly dto: CreateTransactionDto
    ) {
        super()
    }
}
