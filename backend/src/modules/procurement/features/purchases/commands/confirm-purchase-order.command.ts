import type { PurchaseId } from '../../../domain/types/purchases.type'

export class ConfirmPurchaseOrderCommand {
	constructor(public readonly purchaseId: PurchaseId) {}
}
