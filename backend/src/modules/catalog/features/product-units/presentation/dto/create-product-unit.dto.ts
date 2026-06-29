import * as Swagger from '@nestjs/swagger'

import type {
	ProductUnitName,
	ProductUnitConversionFactor,
	ProductUnitIsBaseUnit,
} from '../../../../domain/types/product-unit.type'

export class CreateProductUnitDto {
	@Swagger.ApiProperty({
		required: true,
		example: 'pack',
	})
	name: ProductUnitName

	@Swagger.ApiProperty({
		required: true,
		example: 6,
	})
	conversionFactor: ProductUnitConversionFactor

	@Swagger.ApiProperty({
		required: true,
		example: false,
		default: false,
	})
	isBaseUnit: ProductUnitIsBaseUnit
}
