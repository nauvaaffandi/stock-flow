import {
	Controller,
	Post,
	Body,
	Get,
	Param,
	Query,
	UseFilters,
	ConflictException,
} from '@nestjs/common'
import { CommandBus, EventBus } from '@nestjs/cqrs'
import * as Swagger from '@nestjs/swagger'

import { HttpErrorFilter } from '../../../../../../shared/filters/http-error.filter'
import { ZodErrorFilter } from '../../../../../../shared/filters/zod-error.filter'
import { GlobalErrorFilter } from '../../../../../../shared/filters/global-error.filter'
import { ProductNotFoundErrorFilter } from '../../../../../../shared/filters/products/product-not-found-error.filter'
import { ProductUnitNotFoundErrorFilter } from '../../../../../../shared/filters/product-units/product-unit-not-found.filter'
import { ProductUnitPriceAlreadyExistsErrorFilter } from '../../../../../../shared/filters/product-unit-prices/product-unit-price-already-exists.filter'

import { ZodValidationPipe } from '../../../../../../shared/pipes/zod-validation.pipe'
import { CreateProductUnitPriceZodValidation } from '../validation/create-product-unit-price.zod'

import { SwaggerInternalError } from '../../../../../../shared/decorators/swagger/swagger-internal-error.decorator'
import { SwaggerZodValidationResponse } from '../../../../../../shared/decorators/swagger/swagger-zod-validation-response.decorator'
import { SwaggerProductNotFound } from '../../../../../../shared/decorators/swagger/products/swagger-product-not-found.decorator'
import { SwaggerProductUnitNotFound } from '../../../../../../shared/decorators/swagger/product-units/swagger-product-unit-not-found.decorator'
import { SwaggerProductUnitPriceAlreadyExists } from '../../../../../../shared/decorators/swagger/product-unit-prices/swagger-product-unit-price-already-exists.decorator'

import { CreateProductUnitPriceDto } from '../dto/create-product-unit-price.dto'

import { CreateProductUnitPriceCommand } from '../../commands/create-product-unit-price.command'

import type { ProductId } from '../../../../domain/types/product.type'
import type { ProductUnitId } from '../../../../domain/types/product-unit.type'

@Swagger.ApiTags('Catalog:main - product unit price')
@Controller('catalog')
export class ProductUnitPricesMainController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly eventBus: EventBus,
	) {}

	@Swagger.ApiCreatedResponse({
		description: 'Product unit price create successfully',
		content: {
			'application/json': {
				example: {
					success: true,
					data: {
						id: '"Product unit price id"',
						product_id: '"Product id"',
						unitId: '"Unit id"',
						selling_price: 50000,
						is_active: true,
						created_at: new Date(),
						updated_at: new Date(),
					},
				},
			},
		},
	})
	@SwaggerInternalError()
	@SwaggerZodValidationResponse()
	@SwaggerProductUnitPriceAlreadyExists.single()
	@Swagger.ApiNotFoundResponse({
		description: 'Not found property',
		content: {
			'application/json': {
				examples: {
					ProductNotFound: {
						summary: SwaggerProductNotFound.summary(),
						value: SwaggerProductNotFound.response(),
					},
					ProductUnitNotFound: {
						summary: SwaggerProductUnitNotFound.summary(),
						value: SwaggerProductUnitNotFound.response(),
					},
				},
			},
		},
	})
	@Swagger.ApiParam({
		name: 'productId',
		description: 'ID of product',
		example: '01KW7HJ9EGHR0R53VAK4GW7TWQ_EwIsIGLglb',
	})
	@Swagger.ApiParam({
		name: 'unitId',
		description: 'ID of product unit',
		example: '01KW7HNE46SZ4C72NK0F9QG2Z4_uZ4wg25i42',
	})
	@UseFilters(
		GlobalErrorFilter,
		ProductUnitNotFoundErrorFilter,
		ProductNotFoundErrorFilter,
		ProductUnitPriceAlreadyExistsErrorFilter,
		HttpErrorFilter,
		ZodErrorFilter,
	)
	@Post('products/:productId/units/:unitId')
	async createProductUnitPrice(
		@Body(new ZodValidationPipe(CreateProductUnitPriceZodValidation))
		dto: CreateProductUnitPriceDto,
		@Param('productId') productId: ProductId,
		@Param('unitId') unitId: ProductUnitId,
	): Promise<object> {
		const result = await this.commandBus.execute(
			new CreateProductUnitPriceCommand(productId, unitId, dto),
		)

		return {
			success: true,
			data: {
				id: result.id,
				product_id: result.productId,
				unitId: result.unitId,
				selling_price: result.sellingPrice,
				is_active: result.isActive,
				created_at: result.createdAt,
				updated_at: result.updatedA,
			},
		}
	}
}
