import type { PurchaseContract } from '../../types/purchases.type'

export class PurchaseNotFoundException extends Error {
	public static readonly code = 'PURCHASE_NOT_FOUND'
	public static readonly summary = 'Purchase not found'
	private purchaseId: PurchaseContract['id']

	private static baseMessage(purchaseId: PurchaseContract['id']) {
		return `Purchase "${purchaseId}" not found`
	}

	ApiResponse() {
		return {
			code: PurchaseNotFoundException.code,
			message: PurchaseNotFoundException.baseMessage(this.purchaseId),
		}
	}

	static response(purchaseId: PurchaseContract['id']) {
		return {
			code: PurchaseNotFoundException.code,
			message: PurchaseNotFoundException.baseMessage(purchaseId),
		}
	}

	constructor(purchaseId: PurchaseContract['id']) {
		super(PurchaseNotFoundException.baseMessage(purchaseId))
		this.purchaseId = purchaseId
	}
}
