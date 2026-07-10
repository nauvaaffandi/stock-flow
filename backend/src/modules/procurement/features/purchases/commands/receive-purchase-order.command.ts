import type { PurchaseId, PurchaseStatus, PurchaseReferenceNumber, PurchaseRequest, PurchaseContract } from '../../../domain/types/purchases.type'
import { Command } from '@nestjs/cqrs'

export class ReceivePurchaseOrderCommand extends Command<{
    id: PurchaseContract['id']
    total_cost: PurchaseContract['totalCost']
    status: PurchaseContract['status']
    reference_number: PurchaseContract['referenceNumber']
}>{
    constructor(public readonly purchaseId: PurchaseRequest['id']) {
        super()
    }
}
