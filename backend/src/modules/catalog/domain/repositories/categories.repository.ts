import {
	Category,
	CategoryId,
	CategoryName,
} from '../../domain/types/category.type'

export abstract class CategoriesRepository {
	abstract create(name: string): Promise<Category[]>
	abstract findById(id: CategoryId): Promise<Category | undefined>
	abstract findByName(name: CategoryName): Promise<Category | undefined>
	abstract getListCategories(input: {
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
	}[]>
}
