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

import { Identifier, IdentifierPrefix } from '@core/identifier'
import type { PurchaseContract } from '../../../../domain/types/purchases.type'
import type { PurchaseItemContract } from '../../../../domain/types/purchase-item.type'

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
                        id: Identifier.create(IdentifierPrefix.PURCHASE_ITEM, 292),
						purchase_id: Identifier.create(IdentifierPrefix.PURCHASE, 2927),
						product_id: Identifier.create(IdentifierPrefix.PRODUCT, 5927),
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
		example: Identifier.create(IdentifierPrefix.PURCHASE, 2927),
	})
	@UseFilters(
		PurchaseNotFoundErrorFilter,
		ProductNotFoundErrorFilter,
		ProductUnitNotFoundErrorFilter,
	)
	@Post('purchases/:purchaseId/item')
	async createPurchaseItem(
		@Body(new ZodValidationPipe(CreatePurchaseItemZodValidation))
		dto: CreatePurchaseItemDto,
		@Param('purchaseId') purchaseId: PurchaseContract['id'],
	): Promise<object> {
		const result = await this.commandBus.execute<PurchaseItemContract>(
			new CreatePurchaseItemCommand(purchaseId, dto),
		)
        
		return {
			success: true,
			data: result
		}
	}
}
