import {
	Controller,
	Post,
	Body,
	Param,
	UseFilters,
	ConflictException,
} from '@nestjs/common'
import { CommandBus, EventBus } from '@nestjs/cqrs'
import * as Swagger from '@nestjs/swagger'

import type { ProductContract } from '../../../../domain/types/product.type'

import { ProductNotFoundErrorFilter } from '../../../../../../shared/filters/products/product-not-found-error.filter'

import { ZodValidationPipe } from '../../../../../../shared/pipes/zod-validation.pipe'
import { CreateProductUnitZodValidation } from '../validation/create-product-unit.zod'

import { CreateProductUnitDto } from '../dto/create-product-unit.dto'

import { SwaggerProductNotFound } from '../../../../../../shared/decorators/swagger/products/swagger-product-not-found.decorator'
import { SwaggerZodValidationResponse } from '../../../../../../shared/decorators/swagger/swagger-zod-validation-response.decorator'
import { SwaggerInternalError } from '../../../../../../shared/decorators/swagger/swagger-internal-error.decorator'

import { CreateProductUnitCommand } from '../../commands/create-product-unit.command'

import { Identifier, IdentifierPrefix } from '../../../../../../shared/utils/identifier'

import type { ProductUnitContract } from '../../../../domain/types/product-unit.type'

@Swagger.ApiTags('Catalog - product units')
@Controller('catalog')
export class ProductUnitsMainController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly eventBus: EventBus,
	) {}

	@SwaggerZodValidationResponse()
	@SwaggerProductNotFound.single()
	@SwaggerInternalError()
	@Swagger.ApiConflictResponse({
		description: 'Conflict due to create product unit',
		content: {
			'application/json': {
				example: {
					success: false,
					errors: {
						code: 'CONFLICT_DUE_VALIDATE_CREATE_PRODUCT_UNIT',
						fields: {
							isBaseUnit:
								'Product unit baseUnit already exists in "pcs"',
							name: 'Product unit name(pcs) already exists',
						},
						message: [
							'Product unit baseUnit already exists in "pcs"',
							'Product unit name(pcs) already exists',
						],
					},
				},
			},
		},
	})
	@Swagger.ApiCreatedResponse({
		description: 'Product unit successfully created',
		content: {
			'application/json': {
				example: {
					success: true,
					data: {
						id: Identifier.create(IdentifierPrefix.PRODUCT_UNIT, 2947),
						product_id: Identifier.create(IdentifierPrefix.PRODUCT, 5927),
						name: 'pack',
						conversion_factor: 30,
						is_base_unit: false,
					},
				},
			},
		},
	})
	@Swagger.ApiParam({
		name: 'productId',
		description: 'ID of product',
		example: Identifier.create(IdentifierPrefix.PRODUCT, 2947),
	})
	@UseFilters(
		ProductNotFoundErrorFilter,
	)
	@Post('products/:productId/units')
	async create(
		@Body(new ZodValidationPipe(CreateProductUnitZodValidation))
		dto: CreateProductUnitDto,
		@Param('productId') productId: ProductContract['id'],
	) {
		const result = await this.commandBus.execute<ProductUnitContract>(
			new CreateProductUnitCommand(productId, dto),
		)
        
		return {
			success: true,
			data: result
		}
	}
}
