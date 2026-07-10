import type { ProductId, Product } from '../types/product.type'

export abstract class ProductService {
	abstract getProductById(id: ProductId): Promise<{
		found: boolean
		data?: Product
	}>
}
