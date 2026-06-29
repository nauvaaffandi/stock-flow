import {
	Controller,
	Body,
	Get,
	Post,
	UseFilters,
	Param,
	Delete,
} from '@nestjs/common'
import { CommandBus, EventBus } from '@nestjs/cqrs'
import * as Swagger from '@nestjs/swagger'

import { randomStrSortable } from '../../../../../../shared/libs/random'

import { HttpErrorFilter } from '../../../../../../shared/filters/http-error.filter'
import { ZodErrorFilter } from '../../../../../../shared/filters/zod-error.filter'
import { GlobalErrorFilter } from '../../../../../../shared/filters/global-error.filter'
import { PurchaseNotFoundErrorFilter } from '../../../../../../shared/filters/purchases/purchase-not-found.filter'
import { ProductNotFoundErrorFilter } from '../../../../../../shared/filters/products/product-not-found-error.filter'
import { ProductUnitNotFoundErrorFilter } from '../../../../../../shared/filters/product-units/product-unit-not-found.filter'

import { ZodValidationPipe } from '../../../../../../shared/pipes/zod-validation.pipe'
import { CreatePurchaseItemZodValidation } from '../validation/create-purchase-item.zod'

import { SwaggerInternalError } from '../../../../../../shared/decorators/swagger/swagger-internal-error.decorator'
import { SwaggerZodValidationResponse } from '../../../../../../shared/decorators/swagger/swagger-zod-validation-response.decorator'
import { SwaggerPurchaseNotFound } from '../../../../../../shared/decorators/swagger/purchases/swagger-purchase-not-found.decorator'
import { SwaggerProductNotFound } from '../../../../../../shared/decorators/swagger/products/swagger-product-not-found.decorator'
import { SwaggerProductUnitNotFound } from '../../../../../../shared/decorators/swagger/product-units/swagger-product-unit-not-found.decorator'

import { CreatePurchaseItemCommand } from '../../commands/create-purchase-item.command'

import { CreatePurchaseItemDto } from '../dto/create-purchase-item.dto'

import type { PurchaseId } from '../../../../domain/types/purchases.type'
import type { PurchaseItem } from '../../../../domain/types/purchase-item.type'

@Swagger.ApiTags('Procurement - purchase item')
@Controller('procurement')
export class PurchaseItemsMainController {
	constructor(
		private readonly eventBus: EventBus,
		private readonly commandBus: CommandBus,
	) {}

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
					PurchaseNotFound: {
						summary: SwaggerPurchaseNotFound.summary(),
						value: SwaggerPurchaseNotFound.response(),
					},
				},
			},
		},
	})
	@SwaggerInternalError()
	@SwaggerZodValidationResponse()
	@Swagger.ApiCreatedResponse({
		description: 'Successfully created purchase item',
		content: {
			'application/json': {
				example: {
					success: true,
					data: {
						purchase_id: randomStrSortable(),
						product_id: randomStrSortable(),
						unit_name: 'pack',
						conversion_factor: 6,
						quantity: 8,
						quantity_in_base: 48,
						unit_cost: 5000,
						subtotal: 40000,
					},
				},
			},
		},
	})
	@Swagger.ApiParam({
		name: 'purchaseId',
		required: true,
		description: 'id of purchase',
		example: '01KW9JJTX2VQ71HXHMGK18F8XN_HNtSPEwYDk',
	})
	@UseFilters(
		GlobalErrorFilter,
		PurchaseNotFoundErrorFilter,
		ProductNotFoundErrorFilter,
		ProductUnitNotFoundErrorFilter,
		HttpErrorFilter,
		ZodErrorFilter,
	)
	@Post('purchase/:purchaseId/item')
	async createPurchaseItem(
		@Body(new ZodValidationPipe(CreatePurchaseItemZodValidation))
		dto: CreatePurchaseItemDto,
		@Param('purchaseId') purchaseId: PurchaseId,
	): Promise<object> {
		const result = await this.commandBus.execute<PurchaseItem>(
			new CreatePurchaseItemCommand(purchaseId, dto),
		)

		return {
			success: true,
			data: {
				purchase_id: result.purchaseId,
				product_id: result.productId,
				unit_name: result.unitName,
				conversion_factor: result.conversionFactor,
				quantity: result.quantity,
				quantity_in_base: result.quantityInBase,
				unit_cost: result.unitCost,
				subtotal: result.subtotal,
			},
		}
	}
}
