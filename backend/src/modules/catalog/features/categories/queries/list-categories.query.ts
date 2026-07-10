import { Query } from '@nestjs/cqrs'
import type { Category, CategoryContract } from '../../../domain/types/category.type'

export class ListCategoriesQuery extends Query<{
    pagination: any
    data: {
        id: CategoryContract['id']
        name: CategoryContract['name']
        isActive: CategoryContract['isActive']
    }[]
}> {
    constructor(
        public readonly page: number,
        public readonly limit: number,
        public readonly ids: string | undefined,
        public readonly search: string | undefined, 
        public readonly sortOrder: 'asc' | 'desc',
        public readonly isActive: 'true' | 'false' | undefined
    ) {
        super()
    }
}
