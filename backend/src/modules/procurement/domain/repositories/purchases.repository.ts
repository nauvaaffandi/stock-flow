import {
	PurchaseId,
	CreatePurchase,
	GetPurchase,
	Purchase,
} from '../types/purchases.type'

export abstract class PurchasesRepository {
	abstract create(input: CreatePurchase): Promise<GetPurchase>
	abstract existsById(id: PurchaseId): Promise<{ id: PurchaseId } | undefined>
	abstract confirmPurchase(input: {
		purchaseId: PurchaseId
		totalCost: number
	}): Promise<{
		total_cost: number
		status: string
		reference_number: string
	}>
}
