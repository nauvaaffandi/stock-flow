import type { PurchaseContract } from '../../../procurement'

export class CreateStockMovementFromPurchaseEvent {
    constructor(
        public readonly purchaseId: PurchaseContract['id']
    ) {}
}




