import type {
	CreateProductUnitPrice,
	ProductUnitPrice,
	ProductUnitPriceId,
} from '../types/product-unit-price.type'
import type { ProductId } from '../types/product.type'
import type { ProductUnitId } from '../types/product-unit.type'

export abstract class ProductUnitPricesRepository {
	abstract create(input: CreateProductUnitPrice): Promise<ProductUnitPrice>
	abstract existsByProductIdAndUnitId(
		productId: ProductId,
		unitId: ProductUnitId,
	): Promise<
		| {
				id: ProductUnitPriceId
				isActive: boolean
		  }
		| undefined
	>
}
