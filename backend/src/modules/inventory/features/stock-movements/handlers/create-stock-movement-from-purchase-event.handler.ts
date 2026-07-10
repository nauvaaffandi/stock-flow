import { CreateStockMovementFromPurchaseEvent } from '../../../domain/events/create-stock-movement-from-purchase.event'
import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { PurchaseItemsService } from '../../../../procurement'
import { StockMovementRepository } from '../../../domain/repositories/stock-movement.repository'
import { Identifier, IdentifierPrefix } from '../../../../../shared/utils/identifier'

@EventsHandler(CreateStockMovementFromPurchaseEvent)
export class CreateStockMovementFromPurchaseEventHandler 
    implements IEventHandler<CreateStockMovementFromPurchaseEvent>
{   
    constructor(
        private readonly purchaseItemsService: PurchaseItemsService,
        private readonly stockMovementRepo: StockMovementRepository
    ) {}
    
    async handle(event: CreateStockMovementFromPurchaseEvent) {
        const purchaseId = Identifier.parse(event.purchaseId).id
        
        const purchaseItems = await this.purchaseItemsService.getItemsByPurchaseId(purchaseId)
        
        for(const item of purchaseItems) {
            await this.stockMovementRepo.createByEvent({
                transactionId: item.id,
                productId: item.productId,
                type: 'PURCHASE',
                quantity: item.quantityInBase,
                referenceId: Identifier.create( IdentifierPrefix.PURCHASE, item.purchaseId),
                referenceType: 'PURCHASE'
            }) 
        }
    }
}
