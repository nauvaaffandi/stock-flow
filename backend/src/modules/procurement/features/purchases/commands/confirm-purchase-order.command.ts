import type { PurchaseRequest } from '../../../domain/types/purchases.type'

export class ConfirmPurchaseOrderCommand {
	constructor(public readonly purchaseId: PurchaseRequest['id']) {}
}
