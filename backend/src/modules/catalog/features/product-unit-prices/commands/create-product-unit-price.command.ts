import { CreateProductUnitPriceDto } from '../presentation/dto/create-product-unit-price.dto'
import { Command } from '@nestjs/cqrs'
import type { ProductContract } from '../../../domain/types/product.type'
import type { ProductUnitContract } from '../../../domain/types/product-unit.type'
import type { ProductUnitPriceContract } from '../../../domain/types/product-unit-price.type'

export class CreateProductUnitPriceCommand extends Command<ProductUnitPriceContract> {
	constructor(
		public readonly productId: ProductContract['id'],
		public readonly unitId: ProductUnitContract['id'],
		public readonly dto: CreateProductUnitPriceDto,
	) {
        super()
	}
}
