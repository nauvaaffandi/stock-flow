import { Injectable } from '@nestjs/common'
import { purchaseItems } from '../schema'
import { ConnectionService } from '../../../../../infrastructure/drizzle/connection.service'
import { ilike, eq, and, isNull, or, lt, sql, count } from 'drizzle-orm'
import { PurchaseItemsRepository } from '../../../domain/repositories/puchase-items.repository'
import type { Database } from '../../../../../infrastructure/drizzle'
import type {
	CreatePurchaseItem,
	PurchaseItem,
} from '../../../domain/types/purchase-item.type'
import type { PurchaseId } from '../../../domain/types/purchases.type'

@Injectable()
export class PurchaseItemsRepositoryDrizzle implements PurchaseItemsRepository {
	private readonly db: Database

	constructor(private readonly connection: ConnectionService) {
		this.db = connection.client
	}

	async create(input: CreatePurchaseItem): Promise<PurchaseItem> {
		const [result] = await this.db
			.insert(purchaseItems)
			.values(input)
			.returning()

		return result
	}

	async getsById(id: PurchaseId): Promise<PurchaseItem[]> {
		const result = await this.db
			.select()
			.from(purchaseItems)
			.where(eq(purchaseItems.purchaseId, id))

		return result
	}
}
