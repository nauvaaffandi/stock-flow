import {
	PurchaseId,
	CreatePurchase,
	PurchaseReferenceNumber,
	PurchaseStatus,
	Purchase,
} from '../types/purchases.type'

export abstract class PurchasesRepository {
	abstract create(input: CreatePurchase): Promise<Purchase>
	abstract existsById(id: PurchaseId): Promise<{ id: PurchaseId } | undefined>
	abstract confirmPurchase(input: {
		purchaseId: PurchaseId
		totalCost: number
	}): Promise<{
		totalCost: number
		status: PurchaseStatus
		referenceNumber: PurchaseReferenceNumber
	}>
	abstract checkStatus(id: PurchaseId): Promise<{
        id: PurchaseId
        status: PurchaseStatus
	}>
	abstract receivePurchase(id: PurchaseId): Promise<{
        id: PurchaseId
		totalCost: number
		status: PurchaseStatus
		referenceNumber: PurchaseReferenceNumber
	}>
}
