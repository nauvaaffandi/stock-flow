import { CreateProductUnitDto } from '../presentation/dto/create-product-unit.dto'
import { Command } from '@nestjs/cqrs'
import type { ProductContract } from '../../../domain/types/product.type'
import type { ProductUnitContract } from '../../../domain/types/product-unit.type'

export class CreateProductUnitCommand extends Command<ProductUnitContract> {
	constructor(
		public readonly productId: ProductContract['id'],
		public readonly dto: CreateProductUnitDto,
	) {
        super()
	}
}
