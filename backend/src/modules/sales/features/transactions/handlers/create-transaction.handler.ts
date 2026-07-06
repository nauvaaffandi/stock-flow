import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { TransactionRepository } from '../../../domain/repositories/transaction.repository'
import { CreateTransactionCommand } from '../commands/create-transaction.command'
import type { Transaction } from '../../../domain/types/transactions.type'
import { todayFormatted } from '../../../../../shared/libs/day-utils'
import { randomNumeric } from '../../../../../shared/libs/random'


@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler
    implements ICommandHandler<CreateTransactionCommand>
{
    constructor(
        private readonly transactionRepo: TransactionRepository
    ) {}
    
    
    
    
    async execute(command: CreateTransactionCommand): Promise<Transaction> {
        const { dto } = command
        
        const today = todayFormatted({ noSeparator: true })
        
        const transactionNumber = `TRX-${today}-${randomNumeric(16)}`
        
        const result = await this.transactionRepo.create({
            ...dto,
            transactionNumber,
        })
        
        return result
    }
}
