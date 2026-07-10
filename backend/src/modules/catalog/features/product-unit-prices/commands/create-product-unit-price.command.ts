import { CreateProductUnitPriceDto } from '../presentation/dto/create-product-unit-price.dto'

import type { ProductContract } from '../../../domain/types/product.type'
import type { ProductUnitContract } from '../../../domain/types/product-unit.type'

export class CreateProductUnitPriceCommand {
	constructor(
		public readonly productId: ProductContract['id'],
		public readonly unitId: ProductUnitContract['id'],
		public readonly dto: CreateProductUnitPriceDto,
	) {}
}
