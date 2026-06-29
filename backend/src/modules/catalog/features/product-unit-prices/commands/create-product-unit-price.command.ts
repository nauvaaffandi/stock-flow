import { CreateProductUnitPriceDto } from '../presentation/dto/create-product-unit-price.dto'

import type { ProductId } from '../../../domain/types/product.type'
import type { ProductUnitId } from '../../../domain/types/product-unit.type'

export class CreateProductUnitPriceCommand {
	constructor(
		public readonly productId: ProductId,
		public readonly unitId: ProductUnitId,
		public readonly dto: CreateProductUnitPriceDto,
	) {}
}
