import type { SupplierId } from './suppliers.type'
import type { Replace } from '../../../../types/utilities/replace'

export const PURCHASE_STATUS = {
	DRAFT: 'DRAFT',
	CONFIRMED: 'CONFIRMED',
	RECEIVED: 'RECEIVED',
	CANCELLED: 'CANCELLED',
} as const

export interface Purchase {
	id: number
	supplierId: SupplierId
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

export type PurchaseRequest = Omit<
    Purchase,
    | 'id'
    | 'supplierId'
> & {
    id: string
    supplierId: string
}

export type PurchaseContract = Replace<Purchase, {
    id: string
    supplierId: string
}>
