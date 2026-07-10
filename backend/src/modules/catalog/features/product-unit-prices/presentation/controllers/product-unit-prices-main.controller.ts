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

import { Identifier, IdentifierPrefix } from '../../../../../../shared/utils/identifier'

import type { ProductContract } from '../../../../domain/types/product.type'
import type { ProductUnitContract } from '../../../../domain/types/product-unit.type'
import type { ProductUnitPriceContract } from '../../../../domain/types/product-unit-price.type'

@Swagger.ApiTags('Catalog - product unit price')
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
						id: Identifier.create(IdentifierPrefix.PRODUCT_UNIT_PRICE, 937),
						product_id: Identifier.create(IdentifierPrefix.PRODUCT, 194),
						unit_id: Identifier.create(IdentifierPrefix.PRODUCT_UNIT, 827),
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
		example: Identifier.create(IdentifierPrefix.PRODUCT, 92),
	})
	@Swagger.ApiParam({
		name: 'unitId',
		description: 'ID of product unit',
		example: Identifier.create(IdentifierPrefix.PRODUCT_UNIT, 925),
	})
	@UseFilters(
		ProductUnitNotFoundErrorFilter,
		ProductNotFoundErrorFilter,
		ProductUnitPriceAlreadyExistsErrorFilter,
	)
	@Post('products/:productId/units/:unitId')
	async createProductUnitPrice(
		@Body(new ZodValidationPipe(CreateProductUnitPriceZodValidation))
		dto: CreateProductUnitPriceDto,
		@Param('productId') productId: ProductContract['id'],
		@Param('unitId') unitId: ProductUnitContract['id'],
	): Promise<object> {
		const result = await this.commandBus.execute<ProductUnitPriceContract>(
			new CreateProductUnitPriceCommand(productId, unitId, dto),
		)
        
		return {
			success: true,
			data: result,
		}
	}
}
