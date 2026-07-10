import type { ProductUnitId, ProductUnitName } from '../../types/product-unit.type'

export class ProductUnitNotFoundException extends Error {
	public static readonly code = 'PRODUCT_UNIT_NOT_FOUND'
	public static readonly summary = 'Product unit not found'

	private id: ProductUnitName | ProductUnitId

	private static baseMessage(id: ProductUnitName | ProductUnitId) {
		return `Product unit "${id}" not found`
	}

	ApiResponse() {
		return {
			code: ProductUnitNotFoundException.code,
			message: ProductUnitNotFoundException.baseMessage(this.id),
		}
	}

	static response(id: ProductUnitName | ProductUnitId) {
		return {
			code: ProductUnitNotFoundException.code,
			message: ProductUnitNotFoundException.baseMessage(id),
		}
	}

	constructor(id: ProductUnitName | ProductUnitId) {
		super(ProductUnitNotFoundException.baseMessage(id))
		this.id = id
	}
}
