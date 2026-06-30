import type { PurchaseId } from '../types/purchases.type'
import type { PurchaseItem } from '../types/purchase-item.type'

export abstract class PurchaseItemsService {
    abstract getItemsByPurchaseId(id: PurchaseId): Promise<PurchaseItem[]>
}
