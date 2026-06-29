import * as Swagger from '@nestjs/swagger'
import type { ProductId } from '../../../../domain/types/product.type'
import type { ProductUnitPriceSellingPrice } from '../../../../domain/types/product-unit-price.type'
import type { ProductUnitId } from '../../../../domain/types/product-unit.type'

export class CreateProductUnitPriceDto {
	@Swagger.ApiProperty({
		required: true,
		example: 50000,
	})
	sellingPrice: ProductUnitPriceSellingPrice
}
