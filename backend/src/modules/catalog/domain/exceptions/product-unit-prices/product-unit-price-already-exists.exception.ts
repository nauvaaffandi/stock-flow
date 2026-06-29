import type { ProductId } from '../../types/product.type'
import type {
	ProductUnitId,
	ProductUnitName,
} from '../../types/product-unit.type'

export class ProductUnitPriceAlreadyExistsException extends Error {
	public static readonly code = 'PRODUCT_UNIT_PRICE_ALREADY_EXISTS'
	public static readonly summary = 'Product unit price already exists'
	private productId: ProductId
	private unitName: ProductUnitName
	private unitId: ProductUnitId

	private static baseMessage(unitName: ProductUnitName) {
		return `Product unit(${unitName}) price already exists`
	}

	ApiResponse() {
		return {
			code: ProductUnitPriceAlreadyExistsException.code,
			message: ProductUnitPriceAlreadyExistsException.baseMessage(
				this.unitName,
			),
		}
	}

	static response(unitName: ProductUnitName) {
		return {
			code: ProductUnitPriceAlreadyExistsException.code,
			message:
				ProductUnitPriceAlreadyExistsException.baseMessage(unitName),
		}
	}

	constructor(unitName: ProductUnitName) {
		super(ProductUnitPriceAlreadyExistsException.baseMessage(unitName))
		this.unitName = unitName
	}
}
