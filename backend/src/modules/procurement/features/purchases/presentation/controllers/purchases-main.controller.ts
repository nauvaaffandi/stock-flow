import {
	Controller,
	Post,
	Body,
	UseFilters,
	Get,
	Patch,
	Delete,
	ConflictException,
	NotFoundException,
} from '@nestjs/common'
import * as Swagger from '@nestjs/swagger'
import { CommandBus, EventBus } from '@nestjs/cqrs'

import { ZodValidationPipe } from '../../../../../../shared/pipes/zod-validation.pipe'
import { CreatePurchaseZodValidation } from '../validation/create-purchase.zod'

import { HttpErrorFilter } from '../../../../../../shared/filters/http-error.filter'
import { ZodErrorFilter } from '../../../../../../shared/filters/zod-error.filter'
import { GlobalErrorFilter } from '../../../../../../shared/filters/global-error.filter'
import { SupplierNotFoundErrorFilter } from '../../../../../../shared/filters/suppliers/supplier-not-found.filter'

import { SwaggerInternalError } from '../../../../../../shared/decorators/swagger/swagger-internal-error.decorator'
import { SwaggerZodValidationResponse } from '../../../../../../shared/decorators/swagger/swagger-zod-validation-response.decorator'
import { SwaggerSupplierNotFound } from '../../../../../../shared/decorators/swagger/suppliers/swagger-supplier-not-found.decorator'

import { CreatePurchaseDto } from '../dto/create-purchase.dto'

import { CreatePurchaseCommand } from '../../commands/create-purchase.command'

@Swagger.ApiTags('Procurement - purchases')
@Controller('procurement')
export class PurchasesMainController {
	constructor(
		private readonly eventBus: EventBus,
		private readonly commandBus: CommandBus,
	) {}
	@SwaggerInternalError()
	@SwaggerZodValidationResponse()
	@SwaggerSupplierNotFound.single()
	@Swagger.ApiCreatedResponse({
		description: 'Successfully create purchase',
		content: {
			'application/json': {
				example: {
					success: true,
					data: {
						id: 'Jwidicnwnxbeoib',
						supplier_code: 'SUB/IDX/BUMI',
						reference_number: '#INV/2026/04/10/iwjJId64',
						status: 'DRAFT',
						total_cost: 2927836,
						notes: null,
						received_at: null,
						created_at: new Date(),
						updated_at: new Date(),
					},
				},
			},
		},
	})
	@UseFilters(
		GlobalErrorFilter,
		SupplierNotFoundErrorFilter,
		HttpErrorFilter,
		ZodErrorFilter,
	)
	@Post('purchases')
	async createPurchase(
		@Body(new ZodValidationPipe(CreatePurchaseZodValidation))
		dto: CreatePurchaseDto,
	) {
		const result = await this.commandBus.execute(
			new CreatePurchaseCommand(dto),
		)

		return {
			success: true,
			data: result
		}
	}
}
