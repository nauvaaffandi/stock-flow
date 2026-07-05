import {
	Controller,
	Post,
	Body,
	UseFilters,
	ConflictException,
} from '@nestjs/common'
import { CommandBus, EventBus } from '@nestjs/cqrs'
import * as Swagger from '@nestjs/swagger'

import { HttpErrorFilter } from '../../../../../../shared/filters/http-error.filter'
import { ZodErrorFilter } from '../../../../../../shared/filters/zod-error.filter'
import { GlobalErrorFilter } from '../../../../../../shared/filters/global-error.filter'
import { CategoryAlreadyExistsErrorFilter } from '../../../../../../shared/filters/categories/category-already-exists.filter'
import { CategoryNotFoundErrorFilter } from '../../../../../../shared/filters/categories/category-not-found.filter'
import { ProductAlreadyExistsErrorFilter } from '../../../../../../shared/filters/products/product-already-exists.filter'

import { ZodValidationPipe } from '../../../../../../shared/pipes/zod-validation.pipe'
import { CreateProductZodValidation } from '../validation/create-product.zod'

import { SwaggerInternalError } from '../../../../../../shared/decorators/swagger/swagger-internal-error.decorator'
import { SwaggerZodValidationResponse } from '../../../../../../shared/decorators/swagger/swagger-zod-validation-response.decorator'
import { SwaggerCategoryNotFound } from '../../../../../../shared/decorators/swagger/categories/swagger-category-not-found.decorator'
import { SwaggerProductAlreadyExists } from '../../../../../../shared/decorators/swagger/products/swagger-product-already-exists.decorator'

import { CreateProductCommand } from '../../commands/create-product.command'

import { CreateProductDto } from '../dto/create-product.dto'

import { ProductCreatedEvent } from '../../../../domain/events/product-created.event'

@Swagger.ApiTags('Catalog:main - products')
@Controller('catalog')
export class ProductsMainController {
	constructor(
		private readonly eventBus: EventBus,
		private readonly commandBus: CommandBus,
	) {}

	@Swagger.ApiConflictResponse({
		description: 'Product conflict',
		content: {
			'application/json': {
				examples: {
					CategoryNotFound: {
						summary: SwaggerCategoryNotFound.summary(),
						value: SwaggerCategoryNotFound.response(),
					},
					ProductAlreadyExists: {
						summary: SwaggerProductAlreadyExists.summary(),
						value: SwaggerProductAlreadyExists.response(),
					},
					ConflictDueValidateInDatabase: {
						summary: 'Conflict due validate in database',
						value: {
							success: false,
							errors: {
								code: 'CONFLICT_DUE_VALIDATE_CREATE_PRODUCT',
								fields: {
									barcode: ['Product barcode already exists'],
									name: ['Product name already exists'],
								},
								message: [
									'Product barcode already exists',
									'Product name already exists',
								],
							},
						},
					},
				},
			},
		},
	})
	@Swagger.ApiCreatedResponse({
		description: 'Product successfully created',
		content: {
			'application/json': {
				example: {
					success: true,
					data: {
						id: '01KW7FACEV4211NJQGPAZ70261_LhPDkXmNMR',
						name: 'dev/es kul kul',
						sku: 'SKU_13-6-2026',
						barcode: '00-1111-222',
						category_name: null,
						cost_price: 3200,
						selling_price: 3500,
						is_active: true,
					},
				},
			},
		},
	})
	@SwaggerInternalError()
	@SwaggerZodValidationResponse()
	@SwaggerCategoryNotFound.single()
	@UseFilters(
		GlobalErrorFilter,
		ProductAlreadyExistsErrorFilter,
		CategoryNotFoundErrorFilter,
		HttpErrorFilter,
		ZodErrorFilter,
	)
	@Post('products')
	async CreateProduct(
		@Body(new ZodValidationPipe(CreateProductZodValidation))
		dto: CreateProductDto,
	): Promise<object> {
		const result = await this.commandBus.execute(
			new CreateProductCommand(dto),
		)

		this.eventBus.publish(new ProductCreatedEvent(result))

		return {
			success: true,
			data: result
		}
	}
}
