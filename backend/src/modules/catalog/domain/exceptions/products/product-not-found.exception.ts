import type { ProductId } from '../../types/product.type'

export class ProductNotFoundException extends Error {
	public static readonly code = 'PRODUCT_NOT_FOUND'
	public static readonly summary = 'Product not found'
	private id: ProductId

	private static baseMessage(id: ProductId) {
		return `Product "${id}" not found`
	}

	ApiResponse() {
		return {
			code: ProductNotFoundException.code,
			message: ProductNotFoundException.baseMessage(this.id),
		}
	}

	static response(id: ProductId) {
		return {
			code: ProductNotFoundException.code,
			message: ProductNotFoundException.baseMessage(id),
		}
	}

	constructor(id: ProductId) {
		super(ProductNotFoundException.baseMessage(id))
		this.id = id
	}
}
