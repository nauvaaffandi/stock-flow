import { Injectable } from '@nestjs/common'
import { purchases } from '../schema'
import { ConnectionService } from '../../../../../infrastructure/drizzle/connection.service'
import { ilike, eq, and, isNull, or, lt, sql, count } from 'drizzle-orm'
import { PurchasesRepository } from '../../../domain/repositories/purchases.repository'
import type { Database } from '../../../../../infrastructure/drizzle'
import type {
	CreatePurchase,
	PurchaseId,
	PurchaseReferenceNumber,
	PurchaseStatus,
	Purchase,
} from '../../../domain/types/purchases.type'

@Injectable()
export class PurchasesRepositoryDrizzle implements PurchasesRepository {
	private readonly db: Database

	constructor(private readonly connection: ConnectionService) {
		this.db = connection.client
	}

	async create(input: CreatePurchase): Promise<Purchase> {
		const [result] = await this.db
			.insert(purchases)
			.values(input)
			.returning()

		return result
	}

	async existsById(id: PurchaseId): Promise<{ id: PurchaseId } | undefined> {
		const result = await this.db
			.select({
				id: purchases.id,
			})
			.from(purchases)
			.where(eq(purchases.id, id))
			.limit(1)

		return result[0]
	}

	async confirmPurchase(input: {
		purchaseId: PurchaseId
		totalCost: number
	}): Promise<{
		totalCost: number
		status: PurchaseStatus
		referenceNumber: PurchaseReferenceNumber
	}> {
		const [result] = await this.db
			.update(purchases)
			.set({
				totalCost: input.totalCost,
				status: 'CONFIRMED',
			})
			.where(eq(purchases.id, input.purchaseId))
			.returning({
				totalCost: purchases.totalCost,
				status: purchases.status,
				referenceNumber: purchases.referenceNumber,
			})
        
		return result
	}
	
	
	async checkStatus(id: PurchaseId): Promise<{
        id: PurchaseId
        status: PurchaseStatus
	}> {
        const result = await this.db
            .select({
                id: purchases.id,
                status: purchases.status
            })
            .from(purchases)
            .where(
                eq(purchases.id, id)
            )
            .limit(1)
        
        return result[0]
	}
	
	
	
	async receivePurchase(id:PurchaseId): Promise<{
        id: PurchaseId
		totalCost: number
		status: PurchaseStatus
		referenceNumber: PurchaseReferenceNumber
	}> {
		const [result] = await this.db
			.update(purchases)
			.set({
				status: 'RECEIVED',
			})
			.where(eq(purchases.id, id))
			.returning({
                id: purchases.id,
				totalCost: purchases.totalCost,
				status: purchases.status,
				referenceNumber: purchases.referenceNumber,
			})
        
		return result
	}
}
