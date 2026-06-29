import type { ProductName } from '../../types/product.type'

export class ProductAlreadyExistsException extends Error {
	public static readonly code = 'PRODUCT_ALREADY_EXISTS'
	public static readonly summary = 'Product already exists'
	private productName: ProductName

	private static baseMessage(productName: ProductName) {
		return `Product "${productName}" already exists`
	}

	ApiResponse() {
		return {
			code: ProductAlreadyExistsException.code,
			message: ProductAlreadyExistsException.baseMessage(
				this.productName,
			),
		}
	}

	static response(productName: ProductName) {
		return {
			code: ProductAlreadyExistsException.code,
			message: ProductAlreadyExistsException.baseMessage(productName),
		}
	}

	constructor(productName: ProductName) {
		super(ProductAlreadyExistsException.baseMessage(productName))
		this.productName = productName
	}
}
