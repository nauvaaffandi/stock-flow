import type { SupplierCode } from './suppliers.type'

export const PURCHASE_STATUS = [
	'DRAFT',
	'CONFIRMED',
	'RECEIVED',
	'CANCELLED',
] as const

export interface Purchase {
	id: string
	supplierCode: SupplierCode
	referenceNumber: string
	status: PurchaseStatus
	totalCost: number
	notes?: string | null
	receivedAt?: Date | null
	createdAt?: Date
	updatedAt?: Date
}

export type PurchaseStatus = (typeof PURCHASE_STATUS)[number]

export type PurchaseId = Purchase['id']

export type CreatePurchase = Pick<
	Purchase,
	'supplierCode' | 'referenceNumber' | 'status' | 'totalCost' | 'notes'
>

export type GetPurchase = Pick<
	Purchase,
	| 'id'
	| 'supplierCode'
	| 'referenceNumber'
	| 'status'
	| 'totalCost'
	| 'notes'
	| 'receivedAt'
	| 'createdAt'
	| 'updatedAt'
>
