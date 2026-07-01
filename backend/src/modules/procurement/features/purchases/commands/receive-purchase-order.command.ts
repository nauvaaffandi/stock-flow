import type { PurchaseId, PurchaseStatus, PurchaseReferenceNumber } from '../../../domain/types/purchases.type'
import { Command } from '@nestjs/cqrs'

export class ReceivePurchaseOrderCommand extends Command<{
    id: PurchaseId
    total_cost: number
    status: PurchaseStatus
    reference_number: PurchaseReferenceNumber
}>{
    constructor(public readonly purchaseId: PurchaseId) {
        super()
    }
}
