import type { ProductContract } from '../../types/product.type'

export class ProductNotFoundException extends Error {
	public static readonly code = 'PRODUCT_NOT_FOUND'
	public static readonly summary = 'Product not found'
	private id: ProductContract['id'] | ProductContract['name']

	private static baseMessage(id: ProductContract['id'] | ProductContract['name']) {
		return `Product "${id}" not found`
	}

	ApiResponse() {
		return {
			code: ProductNotFoundException.code,
			message: ProductNotFoundException.baseMessage(this.id),
		}
	}

	static response(id: ProductContract['id'] | ProductContract['name']) {
		return {
			code: ProductNotFoundException.code,
			message: ProductNotFoundException.baseMessage(id),
		}
	}

	constructor(id: ProductContract['id'] | ProductContract['name']) {
		super(ProductNotFoundException.baseMessage(id))
		this.id = id
	}
}
