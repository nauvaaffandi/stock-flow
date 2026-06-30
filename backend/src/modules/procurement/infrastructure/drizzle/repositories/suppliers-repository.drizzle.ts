import { Injectable } from '@nestjs/common'
import { suppliers } from '../schema'
import { ConnectionService } from '../../../../../infrastructure/drizzle/connection.service'
import { ilike, eq, and, isNull, or, lt, sql, count } from 'drizzle-orm'
import { SuppliersRepository } from '../../../domain/repositories/suppliers.repository'
import type { Database } from '../../../../../infrastructure/drizzle/types'
import type {
	Supplier,
	SupplierId,
	SupplierName,
	SupplierCode,
	CreateSupplier,
} from '../../../domain/types/suppliers.type'


@Injectable()
export class SuppliersRepositoryDrizzle implements SuppliersRepository {
	private readonly db: Database

	constructor(private readonly connection: ConnectionService) {
		this.db = connection.client
	}

	async findByName(name: SupplierName): Promise<Supplier[]> {
		const result = await this.db
			.select()
			.from(suppliers)
			.where(ilike(suppliers.name, `%${name}%`))
			.limit(10)

		return result
	}

	async findByCode(code: SupplierCode): Promise<Supplier[]> {
		const result = await this.db
			.select()
			.from(suppliers)
			.where(eq(suppliers.code, code))
			.limit(1)

		return result
	}

	async existsByCode(code: SupplierCode): Promise<
		| {
				id: SupplierId
				code: SupplierCode
				name: SupplierName
		  }
		| undefined
	> {
		const result = await this.db
			.select({
				id: suppliers.id,
				code: suppliers.code,
				name: suppliers.name,
			})
			.from(suppliers)
			.where(eq(suppliers.code, code))
			.limit(1)

		return result[0]
	}

	async create(input: CreateSupplier): Promise<Supplier> {
		const [result] = await this.db
			.insert(suppliers)
			.values(input)
			.returning({
				id: suppliers.id,
				name: suppliers.name,
				code: suppliers.code,
				phone: suppliers.phone,
				address: suppliers.address,
				isActive: suppliers.isActive,
				createdAt: suppliers.createdAt,
				updatedAt: suppliers.updatedAt,
			})

		return result
	}
	
	
	async 
}
