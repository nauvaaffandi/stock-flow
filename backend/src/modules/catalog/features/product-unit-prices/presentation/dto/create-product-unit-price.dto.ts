import * as Swagger from '@nestjs/swagger'
import type { ProductUnitPriceSellingPrice } from '../../../../domain/types/product-unit-price.type'

export class CreateProductUnitPriceDto {
	@Swagger.ApiProperty({
		required: true,
		example: 50000,
	})
	sellingPrice: ProductUnitPriceSellingPrice
}
