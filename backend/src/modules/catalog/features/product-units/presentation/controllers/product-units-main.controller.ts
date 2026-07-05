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

import type { ProductId } from '../../../../domain/types/product.type'

import { HttpErrorFilter } from '../../../../../../shared/filters/http-error.filter'
import { ZodErrorFilter } from '../../../../../../shared/filters/zod-error.filter'
import { GlobalErrorFilter } from '../../../../../../shared/filters/global-error.filter'
import { ProductNotFoundErrorFilter } from '../../../../../../shared/filters/products/product-not-found-error.filter'

import { ZodValidationPipe } from '../../../../../../shared/pipes/zod-validation.pipe'
import { CreateProductUnitZodValidation } from '../validation/create-product-unit.zod'

import { CreateProductUnitDto } from '../dto/create-product-unit.dto'

import { SwaggerProductNotFound } from '../../../../../../shared/decorators/swagger/products/swagger-product-not-found.decorator'
import { SwaggerZodValidationResponse } from '../../../../../../shared/decorators/swagger/swagger-zod-validation-response.decorator'
import { SwaggerInternalError } from '../../../../../../shared/decorators/swagger/swagger-internal-error.decorator'

import { CreateProductUnitCommand } from '../../commands/create-product-unit.command'

@Swagger.ApiTags('Catalog:main - product units')
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
						id: 'uniqueString',
						product_id: 'uniqueString',
						name: 'uniqueString',
						conversion_factor: 'number',
						is_base_unit: 'boolean',
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
	@UseFilters(
		GlobalErrorFilter,
		ProductNotFoundErrorFilter,
		HttpErrorFilter,
		ZodErrorFilter,
	)
	@Post('products/:productId/units')
	async create(
		@Body(new ZodValidationPipe(CreateProductUnitZodValidation))
		dto: CreateProductUnitDto,
		@Param('productId') productId: ProductId,
	) {
		const result = await this.commandBus.execute(
			new CreateProductUnitCommand(productId, dto),
		)

		return {
			success: true,
			data: {
				id: result.id,
				product_id: result.productId,
				name: result.name,
				conversion_factor: result.conversionFactor,
				is_base_unit: result.isBaseUnit,
			},
		}
	}
}
