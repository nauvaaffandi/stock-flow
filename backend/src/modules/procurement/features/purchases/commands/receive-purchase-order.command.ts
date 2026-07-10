import type { PurchaseContract } from '../../../domain/types/purchases.type'
import { Command } from '@nestjs/cqrs'

export class ReceivePurchaseOrderCommand extends Command<{
    id: PurchaseContract['id']
    totalCost: PurchaseContract['totalCost']
    status: PurchaseContract['status']
    referenceNumber: PurchaseContract['referenceNumber']
}>{
    constructor(public readonly purchaseId: PurchaseContract['id']) {
        super()
    }
}
