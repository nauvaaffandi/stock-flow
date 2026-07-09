import type {
	ProductId,
	ProductUnitName,
	ProductUnitConversionFactor,
} from '../../../catalog'
import type { PurchaseId } from './purchases.type'

export interface PurchaseItem {
	id: number
	purchaseId: PurchaseId
	productId: ProductId
	unitName: ProductUnitName
	conversionFactor: ProductUnitConversionFactor
	quantity: number
	quantityInBase: number
	unitCost: number
	subtotal: number
}

export type PurchaseItemQuantity = PurchaseItem['quantity']
export type PurchaseItemUnitCost = PurchaseItem['unitCost']

export type CreatePurchaseItem = Pick<
	PurchaseItem,
	| 'purchaseId'
	| 'productId'
	| 'unitName'
	| 'conversionFactor'
	| 'quantity'
	| 'quantityInBase'
	| 'unitCost'
	| 'subtotal'
>

export type PurchaseItemResponse = Omit<
    PurchaseItem,
    | 'id'
    | 'purchaseId'
    | 'productId'
> & {
    id: string
    purchaseId: string
    productId: string
}



