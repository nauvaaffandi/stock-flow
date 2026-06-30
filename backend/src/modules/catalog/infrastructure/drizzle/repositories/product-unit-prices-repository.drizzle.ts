import { Injectable } from '@nestjs/common'
import { ProductUnitPricesRepository } from '../../../domain/repositories/product-unit-prices.repository'
import { productUnitPrices } from '../schema'
import { ConnectionService } from '../../../../../infrastructure/drizzle'
import { ilike, eq, and, isNull, or, lt, sql, count } from 'drizzle-orm'
import type { Database } from '../../../../../infrastructure/drizzle'
import type {
	CreateProductUnitPrice,
	ProductUnitPrice,
	ProductUnitPriceId,
} from '../../../domain/types/product-unit-price.type'
import type { ProductId } from '../../../domain/types/product.type'
import type { ProductUnitId } from '../../../domain/types/product-unit.type'

@Injectable()
export class ProductUnitPricesRepositoryDrizzle implements ProductUnitPricesRepository {
	private readonly db: Database

	constructor(private readonly connection: ConnectionService) {
		this.db = connection.client
	}

	async create(input: CreateProductUnitPrice): Promise<ProductUnitPrice> {
		const [result] = await this.db
			.insert(productUnitPrices)
			.values({
				...input,
			})
			.onConflictDoNothing({
				target: [productUnitPrices.productId, productUnitPrices.unitId],
			})
			.returning({
				id: productUnitPrices.id,
				productId: productUnitPrices.productId,
				unitId: productUnitPrices.unitId,
				sellingPrice: productUnitPrices.sellingPrice,
				isActive: productUnitPrices.isActive,
				createdAt: productUnitPrices.createdAt,
				updatedAt: productUnitPrices.updatedAt,
			})

		return result
	}

	async existsByProductIdAndUnitId(
		productId: ProductId,
		unitId: ProductUnitId,
	): Promise<
		| {
				id: ProductUnitPriceId
				isActive: boolean
		  }
		| undefined
	> {
		const [result] = await this.db
			.select({
				id: productUnitPrices.id,
				isActive: productUnitPrices.isActive,
			})
			.from(productUnitPrices)
			.where(
				and(
					eq(productUnitPrices.productId, productId),
					eq(productUnitPrices.unitId, unitId),
				),
			)
			.limit(1)

		return result
	}
}
