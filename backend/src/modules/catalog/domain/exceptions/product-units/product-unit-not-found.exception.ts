import type { ProductUnitId } from '../../types/product-unit.type'

export class ProductUnitNotFoundException extends Error {
	public static readonly code = 'PRODUCT_UNIT_NOT_FOUND'
	public static readonly summary = 'Product unit not found'

	private id: ProductUnitId

	private static baseMessage(id: ProductUnitId) {
		return `Product unit "${id}" not found`
	}

	ApiResponse() {
		return {
			code: ProductUnitNotFoundException.code,
			message: ProductUnitNotFoundException.baseMessage(this.id),
		}
	}

	static response(id: ProductUnitId) {
		return {
			code: ProductUnitNotFoundException.code,
			message: ProductUnitNotFoundException.baseMessage(id),
		}
	}

	constructor(id: ProductUnitId) {
		super(ProductUnitNotFoundException.baseMessage(id))
		this.id = id
	}
}
