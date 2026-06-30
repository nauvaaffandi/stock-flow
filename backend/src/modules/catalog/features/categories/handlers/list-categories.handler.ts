import { ListCategoriesQuery } from '../queries/list-categories.query'
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'

import { CategoriesRepository } from '../../.../../../domain/repositories/categories.repository'

import type {
    Category,
    CategoryId,
    CategoryName,
} from '../../../domain/types/category.type'

@QueryHandler(ListCategoriesQuery)
export class ListCategoriesHandler 
    implements IQueryHandler<ListCategoriesQuery>
{
    constructor(private readonly repo: CategoriesRepository) {}
    
    
    async execute(query: ListCategoriesQuery): Promise<{
        pagination: any,
        data: {
            id: CategoryId
            name: CategoryName
            is_active: Category['isActive']
        }[]
    }> {
        const result = await this.repo.getListCategories(query)
        
        
        
        
        
        
        return {
            pagination: {
                page: query.page,
                limit: query.limit,
                ...(query.ids ? { ids: query.ids } : {}),
                ...(query.search ? { search: query.search } : {}),
                sortOrder: query.sortOrder,
                is_active: query.isActive,
            },
            data: result.map(obj => ({
                id: obj.id,
                name: obj.name,
                is_active: obj.isActive
            }))
        }
    }
}
