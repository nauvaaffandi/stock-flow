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
		total_cost: number
		status: PurchaseStatus
		reference_number: PurchaseReferenceNumber
	}>
	abstract checkStatus(id: PurchaseId): Promise<{
        id: PurchaseId
        status: PurchaseStatus
	}>
	abstract receivePurchase(id: PurchaseId): Promise<{
        id: PurchaseId
		total_cost: number
		status: PurchaseStatus
		reference_number: PurchaseReferenceNumber
	}>
}
