import type {
	PurchaseItem,
	CreatePurchaseItem,
} from '../types/purchase-item.type'
import type { PurchaseId } from '../types/purchases.type'

export abstract class PurchaseItemsRepository {
	abstract create(input: CreatePurchaseItem): Promise<PurchaseItem>
	abstract getsById(id: PurchaseId): Promise<PurchaseItem[]>
}
