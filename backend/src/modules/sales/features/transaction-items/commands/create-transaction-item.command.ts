import { CreateTransactionItemDto } from '../presentation/dto/create-transaction-item.dto'
import { TransactionContract } from '../../../domain/types/transactions.type'
import { Command } from '@nestjs/cqrs'

export class CreateTransactionItemCommand 
    extends Command<any>
{
    constructor(
        public readonly transactionId: TransactionContract['id'],
        public readonly dto: CreateTransactionItemDto
    ) {
        super()
    }
}
