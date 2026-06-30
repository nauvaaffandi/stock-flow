import { CategoriesRepository } from '../../../domain/repositories/categories.repository'
import { Injectable } from '@nestjs/common'
import { categories } from '../schema'
import { ConnectionService } from '../../../../../infrastructure/drizzle'
import { ilike, inArray, eq, and, isNull, or, lt, asc, desc, sql, count } from 'drizzle-orm'
import type {
	Category,
	CategoryId,
	CategoryName,
} from '../../../domain/types/category.type'
import type { SQL } from 'drizzle-orm'
import type { Database } from '../../../../../infrastructure/drizzle'

@Injectable()
export class CategoriesRepositoryDrizzle implements CategoriesRepository {
	private db: Database

	constructor(private connection: ConnectionService) {
		this.db = connection.client
	}

	async create(name: CategoryName): Promise<Category[]> {
		const result = await this.db
			.insert(categories)
			.values({
				name: name.trim().toLowerCase(),
			})
			.onConflictDoNothing({
				target: categories.name,
			})
			.returning()

		return result
	}

	async findById(id: CategoryId): Promise<Category | undefined> {
		const result = await this.db
			.select()
			.from(categories)
			.where(eq(categories.id, id))
			.limit(1)

		return result[0]
	}

	async findByName(name: CategoryName): Promise<Category | undefined> {
		const result = await this.db
			.select()
			.from(categories)
			.where(eq(categories.name, name))
			.limit(1)

		return result[0]
	}
	
	async getListCategories(input: {
        page: number | undefined,
        limit: number,
        ids: string | undefined,
        search: string | undefined, 
        sortOrder: 'asc' | 'desc',
        isActive: 'true' | 'false' | undefined
	}): Promise<{
        id: CategoryId
        name: CategoryName
        isActive: Category['isActive']
	}[]> {
        const direction = input.sortOrder == 'asc' ? asc(categories.name) : desc(categories.name)
        
        const conditions: SQL[] = []
        
        if(input.ids && input.ids !== '-') {
            const idList = input.ids.split('-').map(id => parseInt(id, 10))
            
            conditions.push(inArray(categories.id, idList))
        }
        
        if(input.search) {
            conditions.push(ilike(categories.name, `%${input.search}%`))
        }
        
        if(input.isActive == 'true') {
            conditions.push(eq(categories.isActive, true))
        } else if(input.isActive == 'false') {
            conditions.push(eq(categories.isActive, false))
        }
        
        const offset = (input.page - 1) * input.limit
        
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined
        
        const result = await this.db
            .select({
                id: categories.id,
                name: categories.name,
                isActive: categories.isActive,
            })
            .from(categories)
            .where(whereClause)
            .orderBy(direction)
            .limit(input.limit)
            .offset(offset)
        
        return result
	}
}
