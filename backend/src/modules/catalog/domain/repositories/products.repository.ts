import type {
	ProductUniqueField,
	CreateProduct,
	Product,
	ProductId,
	GetProduct,
} from '../types/product.type'

export abstract class ProductsRepository {
	abstract create(input: CreateProduct): Promise<GetProduct>
	abstract findUnique(
		input: ProductUniqueField,
	): Promise<ProductUniqueField[]>
	abstract findById(id: ProductId): Promise<GetProduct | undefined>
	abstract existsById(id: ProductId): Promise<{ id: ProductId } | undefined>
	abstract getProducts(input: {
        page: number,
        limit: number,
        ids: string | undefined,
        search: string | undefined, 
        sortBy: string | undefined,
        sortOrder: 'asc' | 'desc',
        isActive: 'true' | 'false' | undefined
	}): Promise<GetProduct[]> 
}
