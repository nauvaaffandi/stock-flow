import { GetProduct } from '../../../domain/types/product.type'
import { Query } from '@nestjs/cqrs'



export class GetProductsQuery extends Query<{
    data: GetProduct[],
    pagination: any
}> {
    constructor(
        public readonly page: number,
        public readonly limit: number,
        public readonly ids: string | undefined,
        public readonly search: string | undefined,
        public readonly sortBy: string | undefined,
        public readonly sortOrder: 'asc' | 'desc',
        public readonly isActive: 'true' | 'false' | undefined 
    ) {
        super()
    }
}
