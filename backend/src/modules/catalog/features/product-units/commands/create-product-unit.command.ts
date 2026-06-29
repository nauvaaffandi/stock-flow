import { CreateProductUnitDto } from '../presentation/dto/create-product-unit.dto'

import type { ProductId } from '../../../domain/types/product.type'

export class CreateProductUnitCommand {
	constructor(
		public readonly productId: ProductId,
		public readonly dto: CreateProductUnitDto,
	) {}
}
