import { ProductUnitsRepository } from '../../../domain/repositories/product-units.repository'
import { Injectable } from '@nestjs/common'
import { productUnits } from '../schema'
import { ConnectionService } from '../../../../../infrastructure/drizzle'
import { ilike, eq, and, isNull, or, lt, sql, count } from 'drizzle-orm'
import type {
	ProductUnit,
	CreateProductUnit,
	ProductUnitId,
	ProductUnitName,
} from '../../../domain/types/product-unit.type'
import type { ProductId } from '../../../domain/types/product.type'
import type { Database } from '../../../../../infrastructure/drizzle'

@Injectable()
export class ProductUnitsRepositoryDrizzle implements ProductUnitsRepository {
	private readonly db: Database

	constructor(private readonly connection: ConnectionService) {
		this.db = connection.client
	}

	async findUnits(id: ProductId): Promise<ProductUnit[]> {
		const result = await this.db
			.select()
			.from(productUnits)
			.where(eq(productUnits.productId, id))

		return result
	}

	async create(input: CreateProductUnit): Promise<ProductUnit> {
		const [result] = await this.db
			.insert(productUnits)
			.values(input)
			.returning({
				id: productUnits.id,
				productId: productUnits.productId,
				name: productUnits.name,
				conversionFactor: productUnits.conversionFactor,
				isBaseUnit: productUnits.isBaseUnit,
			})

		return result
	}

	async existsById(id: ProductUnitId): Promise<
		| {
				id: ProductUnitId
				name: ProductUnitName
		  }
		| undefined
	> {
		const [result] = await this.db
			.select({
				id: productUnits.id,
				name: productUnits.name,
			})
			.from(productUnits)
			.where(eq(productUnits.id, id))
			.limit(1)

		return result
	}

	async byId(id: ProductUnitId): Promise<ProductUnit | undefined> {
		const [result] = await this.db
			.select()
			.from(productUnits)
			.where(eq(productUnits.id, id))
			.limit(1)

		return result
	}

	async byName(id: ProductUnitName): Promise<ProductUnit | undefined> {
		const [result] = await this.db
			.select()
			.from(productUnits)
			.where(eq(productUnits.name, id))
			.limit(1)

		return result
	}
}
