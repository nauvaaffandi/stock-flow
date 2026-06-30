import type { ProductId } from '../../../catalog'

const STOCK_MOVEMENT_TYPE = [
	'PURCHASE',
	'SALE',
	'ADJUSTMENT_IN',
	'ADJUSTMENT_OUT',
	'RETURN_SUPPLIER',
	'RETURN_CUSTOMER',
	'OPENING_BALANCE',
] as const
const STOCK_MOVEMENT_REFERENCE_TYPE = ['PURCHASE', 'TRANSACTION', 'ADJUSTMENT', 'OPENING_BALANCE'] as const


export interface StockMovement {
    id: string
	productId: ProductId
	transactionId?: string
	type: StockMovementType
	quantity: number
	referenceId: string
	referenceType: StockMovementReferenceType
	notes?: string
	createdAt?: Date
}

export type StockMovementId = StockMovement['id']
export type StockMovementQuantity = StockMovement['quantity']
export type StockMovementReferenceId = StockMovement['referenceId']
export type StockMovementType = typeof STOCK_MOVEMENT_TYPE[number]
export type StockMovementReferenceType = typeof STOCK_MOVEMENT_REFERENCE_TYPE[number]


export type CreateStockMovement = Pick<
    StockMovement,
    | 'productId'
    | 'transactionId'
    | 'type'
    | 'quantity'
    | 'referenceId'
    | 'referenceType'
    | 'notes'
>









