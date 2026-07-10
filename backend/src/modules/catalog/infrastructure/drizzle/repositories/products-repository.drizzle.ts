import { ProductsRepository } from '../../../domain/repositories/products.repository'
import { Injectable } from '@nestjs/common'
import { products } from '../schema'
import { ConnectionService } from '../../../../../infrastructure/drizzle'
import { ilike, eq, and, isNull, inArray, or, lt, sql, count, asc, desc, } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import type {
	Product,
	ProductId,
	CreateProduct,
	ProductUniqueField,
} from '../../../domain/types/product.type'
import type { Database } from '../../../../../infrastructure/drizzle'

@Injectable()
export class ProductsRepositoryDrizzle implements ProductsRepository {
	private readonly db: Database

	constructor(private readonly connection: ConnectionService) {
		this.db = connection.client
	}

	async findByName(name: string): Promise<Product[]> {
		const result = await this.db
			.select({
				id: products.id,
				name: products.name,
				sku: products.sku,
				barcode: products.barcode,
				isActive: products.isActive,
				baseUnit: products.baseUnit,
				costPrice: products.costPrice,
				sellingPrice: products.sellingPrice,
			})
			.from(products)
			.where(ilike(products.name, `%${name}%`))

		return result
	}

	async findBySku(sku: string): Promise<Product[]> {
		const result = await this.db
			.select({
				id: products.id,
				name: products.name,
				sku: products.sku,
				barcode: products.barcode,
				isActive: products.isActive,
				baseUnit: products.baseUnit,
				costPrice: products.costPrice,
				sellingPrice: products.sellingPrice,
			})
			.from(products)
			.where(eq(products.sku, sku))
			.limit(1)

		return result
	}

	async findByBarcode(barcode: string): Promise<Product[]> {
		const result = await this.db
			.select({
				id: products.id,
				name: products.name,
				sku: products.sku,
				barcode: products.barcode,
				isActive: products.isActive,
				costPrice: products.costPrice,
				baseUnit: products.baseUnit,
				sellingPrice: products.sellingPrice,
			})
			.from(products)
			.where(eq(products.barcode, barcode))
			.limit(1)

		return result
	}

	async findById(id: ProductId): Promise<Product | undefined> {
		const result = await this.db
			.select({
				id: products.id,
				name: products.name,
				sku: products.sku,
				barcode: products.barcode,
				isActive: products.isActive,
				costPrice: products.costPrice,
				baseUnit: products.baseUnit,
				sellingPrice: products.sellingPrice,
				createdAt: products.createdAt,
				updatedAt: products.updatedAt,
			})
			.from(products)
			.where(eq(products.id, id))
			.limit(1)

		return result[0]
	}

	async create(input: CreateProduct): Promise<Product> {
		const [result] = await this.db
			.insert(products)
			.values({
				...input,
			})
			.onConflictDoNothing({
				target: products.sku,
			})
			.returning({
				id: products.id,
				name: products.name,
				sku: products.sku,
				barcode: products.barcode,
				categoryId: products.categoryId,
				baseUnit: products.baseUnit,
				costPrice: products.costPrice,
				sellingPrice: products.sellingPrice,
				isActive: products.isActive,
			})

		return result
	}

	async findUnique(input: ProductUniqueField): Promise<ProductUniqueField[]> {
		const result = await this.db
			.select({
				name: products.name,
				barcode: products.barcode,
				sku: products.sku,
			})
			.from(products)
			.where(
				or(
					eq(products.name, input.name),
					eq(products.barcode, input.barcode),
					eq(products.sku, input.sku),
				),
			)

		return result
	}

	async existsById(id: ProductId): Promise<{ id: ProductId } | undefined> {
		const [result] = await this.db
			.select({
				id: products.id,
			})
			.from(products)
			.where(eq(products.id, id))
			.limit(1)

		return result
	}
	
	
	async getProducts(input: {
        page: number,
        limit: number,
        ids: ProductId[] | undefined,
        search: string | undefined, 
        sortBy: string | undefined,
        sortOrder: 'asc' | 'desc',
        isActive: 'true' | 'false' | undefined
	}): Promise<Product[]> {
        const direction = input.sortOrder == 'asc' ? asc(products[input.sortBy ?? 'name']) : desc(products[input.sortBy ?? 'name'])
        
        const conditions: SQL[] = []
        
        if(input.ids) {
            conditions.push(inArray(products.id, input.ids))
        }
        
        if(input.search) {
            conditions.push(ilike(products.name, `%${input.search}%`))
        }
        
        if(input.isActive == 'true') {
            conditions.push(eq(products.isActive, true))
        } else if(input.isActive == 'false') {
            conditions.push(eq(products.isActive, false))
        }
        
        const offset = (input.page - 1) * input.limit
        
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined
        
        const result = await this.db
            .select({
                id: products.id,
                name: products.name,
                categoryId: products.categoryId,                sku: products.sku,
                barcode: products.barcode,
                baseUnit: products.baseUnit,
                costPrice: products.costPrice,
                sellingPrice: products.sellingPrice,
                isActive: products.isActive,
                createdAt: products.createdAt,
                updatedAt: products.updatedAt,
            })
            .from(products)
            .where(whereClause)
            .orderBy(direction)
            .limit(input.limit)
            .offset(offset)
        
        return result
	}
}
