import { CreateProductUnitDto } from '../presentation/dto/create-product-unit.dto'

import type { ProductContract } from '../../../domain/types/product.type'

export class CreateProductUnitCommand {
	constructor(
		public readonly productId: ProductContract['id'],
		public readonly dto: CreateProductUnitDto,
	) {}
}
