import { CreateStockMovementFromPurchaseEvent } from '../../../domain/events/create-stock-movement-from-purchase.event'
import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { PurchaseItemsService } from '../../../../procurement'
import { StockMovementRepository } from '../../../domain/repositories/stock-movement.repository'

@EventsHandler(CreateStockMovementFromPurchaseEvent)
export class CreateStockMovementFromPurchaseEventHandler 
    implements IEventHandler<CreateStockMovementFromPurchaseEvent>
{   
    constructor(
        private readonly purchaseItemsService: PurchaseItemsService,
        private readonly stockMovementRepo: StockMovementRepository
    ) {}
    
    async handle(event: CreateStockMovementFromPurchaseEvent) {
        const purchaseItems = await this.purchaseItemsService.getItemsByPurchaseId(event.purchaseId)
        
        for(const item of purchaseItems) {
            await this.stockMovementRepo.createByEvent({
                productId: item.productId,
                type: 'PURCHASE',
                quantity: item.quantityInBase,
                referenceId: item.id,
                referenceType: 'PURCHASE'
            }) 
        }
    }
}
