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

import { SupplierAlreadyExistsErrorFilter } from '../../../../../../shared/filters/suppliers/supplier-already-exists.filter'

import { CreateSupplierCommand } from '../../commands/create-supplier.command'

import { CreateSupplierDto } from '../dto/create-supplier.dto'

import { SupplierCreatedEvent } from '../../../../domain/events/supplier-created.event'

import { SwaggerInternalError } from '../../../../../../shared/decorators/swagger/swagger-internal-error.decorator'
import { SwaggerZodValidationResponse } from '../../../../../../shared/decorators/swagger/swagger-zod-validation-response.decorator'
import { SwaggerSupplierAlreadyExists } from '../../../../../../shared/decorators/swagger/suppliers/swagger-supplier-already-exists.decorator'

import { Identifier, IdentifierPrefix } from '@core/identifier'
import type { SupplierContract } from '../../../../domain/types/suppliers.type'

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
						id: Identifier.create(IdentifierPrefix.SUPPLIER, 29377),
						name: 'PT SPARINDO RAYA',
						code: 'IND/SPAR/BKS',
						phone: '0827262528',
						address: '-',
						is_active: true,
						created_at: new Date(),
						updated_at: new Date(),
					},
				},
			},
		},
	})
	@UseFilters(
		SupplierAlreadyExistsErrorFilter,
	)
	@Post('suppliers')
	async createSupplier(
		@Body(new ZodValidationPipe(CreateSupplierZodValidation))
		dto: CreateSupplierDto,
	): Promise<object> {
		const result = await this.commandBus.execute<SupplierContract>(
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
