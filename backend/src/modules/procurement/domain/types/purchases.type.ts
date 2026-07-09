import type { SupplierCode } from './suppliers.type'

export const PURCHASE_STATUS = {
	DRAFT: 'DRAFT',
	CONFIRMED: 'CONFIRMED',
	RECEIVED: 'RECEIVED',
	CANCELLED: 'CANCELLED',
} as const

export interface Purchase {
	id: number
	supplierId: SupplierCode
	referenceNumber: string
	status: PurchaseStatus
	totalCost: number
	notes?: string | null
	receivedAt?: Date | null
	createdAt?: Date
	updatedAt?: Date
}

export type PurchaseStatus = (typeof PURCHASE_STATUS)[keyof typeof PURCHASE_STATUS]
export type PurchaseReferenceNumber = Purchase['referenceNumber']
export type PurchaseId = Purchase['id']

export type CreatePurchase = Pick<
	Purchase,
	'supplierId' | 'referenceNumber' | 'status' | 'totalCost' | 'notes'
>

export type PurchaseResponse = Omit<
	Purchase,
	| 'id'
	| 'supplierId'
> & {
    id: string
    supplierId: string
}
