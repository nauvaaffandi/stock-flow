import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { TransactionRepository } from '../../../domain/repositories/transaction.repository'
import { CreateTransactionCommand } from '../commands/create-transaction.command'
import type { Transaction, TransactionContract } from '../../../domain/types/transactions.type'
import { todayFormatted } from '../../../../../shared/libs/day-utils'
import { randomNumeric } from '../../../../../shared/libs/random'
import { Identifier, IdentifierPrefix } from '@core/identifier'


@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler
    implements ICommandHandler<CreateTransactionCommand>
{
    constructor(
        private readonly transactionRepo: TransactionRepository
    ) {}
    
    
    async execute(command: CreateTransactionCommand): Promise<TransactionContract> {
        const { dto } = command
        
        const result = await this.transactionRepo.create({
            ...dto,
        })
        
        return {
            ...result,
            id: Identifier.create(IdentifierPrefix.CATEGORY, result.id),
        }
    }
}
