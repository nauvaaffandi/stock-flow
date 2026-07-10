import * as Swagger from '@nestjs/swagger'

import type { CategoryContract } from '../../../../domain/types/category.type'
import type {
	ProductName,
	ProductSku,
	ProductBaseUnit,
	ProductCostPrice,
	ProductSellingPrice,
} from '../../../../domain/types/product.type'

export class CreateProductDto {
	@Swagger.ApiProperty({
		required: false,
		example: 'CAT-1',
	})
	categoryId: CategoryContract['id']

	@Swagger.ApiProperty({
		required: true,
		example: 'dev/es kul kul',
	})
	name: ProductName

	@Swagger.ApiProperty({
		required: true,
		example: 'SKU_13-6-2026',
	})
	sku: ProductSku

	@Swagger.ApiProperty({
		required: true,
		example: '00-1111-222',
	})
	barcode: ProductSku

	@Swagger.ApiProperty({
		required: true,
		example: 'pcs',
	})
	baseUnit: ProductBaseUnit

	@Swagger.ApiProperty({
		required: true,
		example: 3200,
	})
	costPrice: ProductCostPrice

	@Swagger.ApiProperty({
		required: true,
		example: 3500,
	})
	sellingPrice: ProductSellingPrice
}
