import type { CreateStockMovement } from '../types/stock-movement'
import type { PurchaseId } from '../../../procurement'

export class CreateStockMovementFromPurchaseEvent {
    constructor(
        public readonly purchaseId: PurchaseId
    ) {}
}




