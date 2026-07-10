import { Command } from '@nestjs/cqrs'
import type { PurchaseContract } from '../../../domain/types/purchases.type'


export class ConfirmPurchaseOrderCommand extends Command<{
    referenceNumber: PurchaseContract['referenceNumber']
    totalCost: PurchaseContract['totalCost']
    status: PurchaseContract['status']
}> {
	constructor(
        public readonly purchaseId: PurchaseContract['id']
    ) {
        super()
    }
}
