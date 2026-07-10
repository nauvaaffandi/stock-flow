import * as Swagger from '@nestjs/swagger'
import type { ProductUnitContract } from '../../../../domain/types/product-unit.type'

export class CreateProductUnitDto {
	@Swagger.ApiProperty({
		required: true,
		example: 'pack',
	})
	name: ProductUnitContract['name']

	@Swagger.ApiProperty({
		required: true,
		example: 6,
	})
	conversionFactor: ProductUnitContract['conversionFactor']

	@Swagger.ApiProperty({
		required: true,
		example: false,
		default: false,
	})
	isBaseUnit: ProductUnitContract['isBaseUnit']
}
