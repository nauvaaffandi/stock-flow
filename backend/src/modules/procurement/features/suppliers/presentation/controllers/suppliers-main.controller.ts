import {
	Controller,
	Post,
	Body,
	Get,
	Param,
	Patch,
	Delete,
	UseFilters,
	ConflictException,
} from '@nestjs/common'
import * as Swagger from '@nestjs/swagger'
import { CommandBus, EventBus } from '@nestjs/cqrs'

import { ZodValidationPipe } from '../../../../../../shared/pipes/zod-validation.pipe'
import { CreateSupplierZodValidation } from '../validation/create-supplier.zod'

import { HttpErrorFilter } from '../../../../../../shared/filters/http-error.filter'
import { ZodErrorFilter } from '../../../../../../shared/filters/zod-error.filter'
import { GlobalErrorFilter } from '../../../../../../shared/filters/global-error.filter'
import { SupplierAlreadyExistsErrorFilter } from '../../../../../../shared/filters/suppliers/supplier-already-exists.filter'

import { CreateSupplierCommand } from '../../commands/create-supplier.command'

import { CreateSupplierDto } from '../dto/create-supplier.dto'

import { SupplierCreatedEvent } from '../../../../domain/events/supplier-created.event'

import { SwaggerInternalError } from '../../../../../../shared/decorators/swagger/swagger-internal-error.decorator'
import { SwaggerZodValidationResponse } from '../../../../../../shared/decorators/swagger/swagger-zod-validation-response.decorator'
import { SwaggerSupplierAlreadyExists } from '../../../../../../shared/decorators/swagger/suppliers/swagger-supplier-already-exists.decorator'

@Swagger.ApiTags('Procurement - suppliers')
@Controller('procurement')
export class SuppliersMainController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly eventBus: EventBus,
	) {}

	@SwaggerSupplierAlreadyExists.single()
	@SwaggerZodValidationResponse()
	@SwaggerInternalError()
	@Swagger.ApiCreatedResponse({
		description: 'successfully create supplier',
		content: {
			'application/json': {
				example: {
					success: true,
					data: {
						id: 'example supplier id',
						name: 'example supplier name',
						code: 'example supplier code',
						phone: 'example supplier phone',
						address: 'example supplier address',
						is_active: 'boolean',
						created_at: 'Date',
						updated_at: 'Date',
					},
				},
			},
		},
	})
	@UseFilters(
		GlobalErrorFilter,
		SupplierAlreadyExistsErrorFilter,
		HttpErrorFilter,
		ZodErrorFilter,
	)
	@Post('suppliers')
	async createSupplier(
		@Body(new ZodValidationPipe(CreateSupplierZodValidation))
		dto: CreateSupplierDto,
	): Promise<object> {
		const result = await this.commandBus.execute(
			new CreateSupplierCommand(dto),
		)

		this.eventBus.publish(
			new SupplierCreatedEvent(result.id, result.name, result.code),
		)

		return {
			success: true,
			data: result
		}
	}
}
