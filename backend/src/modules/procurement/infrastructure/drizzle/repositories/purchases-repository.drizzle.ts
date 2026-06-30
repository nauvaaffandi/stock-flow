import { Injectable } from '@nestjs/common'
import { purchases } from '../schema'
import { ConnectionService } from '../../../../../infrastructure/drizzle/connection.service'
import { ilike, eq, and, isNull, or, lt, sql, count } from 'drizzle-orm'
import { PurchasesRepository } from '../../../domain/repositories/purchases.repository'
import type { Database } from '../../../../../infrastructure/drizzle'
import type {
	CreatePurchase,
	GetPurchase,
	PurchaseId,
	Purchase,
} from '../../../domain/types/purchases.type'

@Injectable()
export class PurchasesRepositoryDrizzle implements PurchasesRepository {
	private readonly db: Database

	constructor(private readonly connection: ConnectionService) {
		this.db = connection.client
	}

	async create(input: CreatePurchase): Promise<GetPurchase> {
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
		total_cost: number
		status: string
		reference_number: string
	}> {
		const [result] = await this.db
			.update(purchases)
			.set({
				totalCost: input.totalCost,
				status: 'CONFIRMED',
			})
			.where(eq(purchases.id, input.purchaseId))
			.returning({
				total_cost: purchases.totalCost,
				status: purchases.status,
				reference_number: purchases.referenceNumber,
			})

		return result
	}
}
