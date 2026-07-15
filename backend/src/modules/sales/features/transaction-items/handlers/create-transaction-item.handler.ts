import { CreateTransactionItemCommand } from '../commands/create-transaction-item.command'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { TransactionItemRepository } from '../../../domain/repositories/transaction-item.repository'
import { Identifier, IdentifierPrefix } from '@core/identifier'
import { ProductService } from '@modules/catalog'

@CommandHandler(CreateTransactionItemCommand)
export class CreateTransactionItemHandler
    implements ICommandHandler<CreateTransactionItemCommand>
{
    constructor(
        private readonly productService: ProductService
    ) {}
    
    
    async execute(command: CreateTransactionItemCommand): Promise<any> {
        const { dto } = command
        
        const transactionId = Identifier.parse(command.transactionId)
        
        
        const productId = Identifier.parse(dto.productId)
        
        
        const unitId = Identifier.parse(dto.unitId)
        
        
        
        
        
        
        
        
        
    }
}
