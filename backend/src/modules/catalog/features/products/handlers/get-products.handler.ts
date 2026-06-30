import { ProductsRepository } from '../../../domain/repositories/products.repository'
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { GetProductsQuery } from '../queries/get-products.query'



@QueryHandler(GetProductsQuery)
export class GetProductsHandler 
    implements IQueryHandler<GetProductsQuery>
{
    constructor(
        private readonly repo: ProductsRepository
    ) {}
    
    
    async execute(query: GetProductsQuery) {
        const result = await this.repo.getProducts(query)
        
        return {
            data: result,
            pagination: {
                page: query.page,
                limit: query.limit,
                ...(query.ids ? {
                    ids: query.ids.split('-')
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
