import type {
	ProductUniqueField,
	CreateProduct,
	Product,
	ProductId,
} from '../types/product.type'

export abstract class ProductsRepository {
	abstract create(input: CreateProduct): Promise<Product>
	abstract findUnique(
		input: ProductUniqueField,
	): Promise<ProductUniqueField[]>
	abstract findById(id: ProductId): Promise<Product | undefined>
	abstract existsById(id: ProductId): Promise<{ id: ProductId } | undefined>
	abstract getProducts(input: {
        page: number,
        limit: number,
        ids: ProductId[] | undefined,
        search: string | undefined, 
        sortBy: string | undefined,
        sortOrder: 'asc' | 'desc',
        isActive: 'true' | 'false' | undefined
	}): Promise<Product[]> 
}
