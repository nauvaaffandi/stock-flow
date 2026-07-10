import { ProductsRepository } from '../../../domain/repositories/products.repository'
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { GetProductsQuery } from '../queries/get-products.query'
import type { ProductContract } from '../../../domain/types/product.type'
import { Identifier, IdentifierPrefix } from '../../../../../shared/utils/identifier'

@QueryHandler(GetProductsQuery)
export class GetProductsHandler 
    implements IQueryHandler<GetProductsQuery>
{
    constructor(
        private readonly repo: ProductsRepository
    ) {}
    
    
    async execute(query: GetProductsQuery): Promise<{
        pagination: any
        data: ProductContract[]
    }> {
        const result = await this.repo.getProducts({
            ...query,
            ids: query.ids?.split(',').map(id => 
                Identifier.parse(id).id
            )
        })
        
        return {
            data: result.map(obj => ({
                ...obj,
                id: Identifier.create(IdentifierPrefix.PRODUCT, obj.id),
                categoryId: obj.categoryId == null ? null : Identifier.create( IdentifierPrefix.CATEGORY, obj.categoryId)
            })),
            pagination: {
                page: query.page,
                limit: query.limit,
                ...(query.ids ? {
                    ids: query.ids?.split(',')
                } : {}),
                ...(query.search ? {
                    search: query.search
                } : {}),
                ...(query.sortBy ? {
                    sort_by: query.sortBy
                }:{
                    sort_by: 'name'
                }),
                sort_order: query.sortOrder,
                ...(query.isActive == 'true' ? {
                    is_active: true
                } : query.isActive == 'false' ? {
                    is_active: false,
                } : {})
            }
        }
    }
}
