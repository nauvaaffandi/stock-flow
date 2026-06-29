import type { PurchaseId } from '../../types/purchases.type'

export class PurchaseNotFoundException extends Error {
	public static readonly code = 'PURCHASE_NOT_FOUND'
	public static readonly summary = 'Purchase not found'
	private purchaseId: PurchaseId

	private static baseMessage(purchaseId: PurchaseId) {
		return `Purchase "${purchaseId}" not found`
	}

	ApiResponse() {
		return {
			code: PurchaseNotFoundException.code,
			message: PurchaseNotFoundException.baseMessage(this.purchaseId),
		}
	}

	static response(purchaseId: PurchaseId) {
		return {
			code: PurchaseNotFoundException.code,
			message: PurchaseNotFoundException.baseMessage(purchaseId),
		}
	}

	constructor(purchaseId: PurchaseId) {
		super(PurchaseNotFoundException.baseMessage(purchaseId))
		this.purchaseId = purchaseId
	}
}
