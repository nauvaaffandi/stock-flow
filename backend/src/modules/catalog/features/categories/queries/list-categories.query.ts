import { Query } from '@nestjs/cqrs'
import { Category } from '../../../domain/types/category.type'

export class ListCategoriesQuery extends Query<{
    pagination: any
    data: {
        id: Category['id']
        name: Category['name']
        is_active: Category['isActive']
    }[]
}> {
    constructor(
        public readonly page: number | undefined,
        public readonly limit: number,
        public readonly ids: string | undefined,
        public readonly search: string | undefined, 
        public readonly sortOrder: 'asc' | 'desc',
        public readonly isActive: 'true' | 'false' | undefined
    ) {
        super()
    }
}
