import { ListCategoriesQuery } from '../queries/list-categories.query'
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { CategoriesRepository } from '../../.../../../domain/repositories/categories.repository'

import { Identifier, IdentifierPrefix } from '../../../../../shared/utils/identifier'

import type {
    Category,
    CategoryId,
    CategoryName,
    CategoryContract,
} from '../../../domain/types/category.type'



@QueryHandler(ListCategoriesQuery)
export class ListCategoriesHandler 
    implements IQueryHandler<ListCategoriesQuery>
{
    constructor(private readonly repo: CategoriesRepository) {}
    
    
    async execute(query: ListCategoriesQuery): Promise<{
        pagination: any,
        data: {
            id: CategoryContract['id']
            name: CategoryContract['name']
            isActive: CategoryContract['isActive']
        }[]
    }> {
        const result = await this.repo.getListCategories({
            ...query,
            ids: query.ids?.split(',').map(id => 
                Identifier.parse(id).id
            )
        })
        
        return {
            pagination: {
                page: query.page,
                limit: query.limit,
                ...(query.ids ? { ids: query.ids?.split(',') } : {}),
                ...(query.search ? { search: query.search } : {}),
                sortOrder: query.sortOrder,
                isActive: query.isActive,
            },
            data: result.map(obj => ({
                id: Identifier.create(IdentifierPrefix.CATEGORY, obj.id),
                name: obj.name,
                isActive: obj.isActive
            }))
        }
    }
}
