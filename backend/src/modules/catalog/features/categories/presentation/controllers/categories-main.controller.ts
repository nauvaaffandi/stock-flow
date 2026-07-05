import {
	Controller,
	Post,
	Get,
	Patch,
	Delete,
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

import { ZodValidationPipe } from '../../../../../../shared/pipes/zod-validation.pipe'

import { SwaggerInternalError } from '../../../../../../shared/decorators/swagger/swagger-internal-error.decorator'
import { SwaggerZodValidationResponse } from '../../../../../../shared/decorators/swagger/swagger-zod-validation-response.decorator'
import { SwaggerCategoryAlreadyExists } from '../../../../../../shared/decorators/swagger/categories/swagger-category-already-exists.decorator'

import { CreateCategoryCommand } from '../../commands/create-category.command'

import { CreateCategoryZodValidation } from '../validation/create-category.zod'

import { CreateCategoryDto } from '../dto/create-category.dto'

import { CategoryCreatedEvent } from '../../../../domain/events/category-created.event'

@Swagger.ApiTags('Catalog:main - categories')
@Controller('catalog')
export class CategoriesMainController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly eventBus: EventBus,
	) {}

	@Swagger.ApiCreatedResponse({
		description: 'Category create successfully',
		schema: {
			example: {
				success: true,
				data: {
					id: 23,
					name: 'obat',
					is_active: true,
					created_at: new Date(),
					updated_at: new Date(),
				},
			},
		},
	})
	@SwaggerCategoryAlreadyExists.single()
	@SwaggerInternalError()
	@SwaggerZodValidationResponse()
	@UseFilters(
		GlobalErrorFilter,
		CategoryAlreadyExistsErrorFilter,
		HttpErrorFilter,
		ZodErrorFilter,
	)
	@Post('categories')
	async create(
		@Body(new ZodValidationPipe(CreateCategoryZodValidation))
		dto: CreateCategoryDto,
	): Promise<object> {
		const result = await this.commandBus.execute(
			new CreateCategoryCommand(dto),
		)

		this.eventBus.publish(new CategoryCreatedEvent(result.id, result.name))

		return {
			success: true,
			data: {
				id: result.id,
				name: result.name,
				is_active: result.isActive,
				created_at: result.createdAt,
				updated_at: result.updatedAt,
			},
		}
	}
}
