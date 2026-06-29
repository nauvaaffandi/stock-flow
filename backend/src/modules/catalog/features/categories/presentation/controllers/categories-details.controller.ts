import {
	Controller,
	Post,
	Get,
	Patch,
	Delete,
	Body,
	Query,
	UseFilters,
	ConflictException,
	ParseIntPipe,
	ParseBoolPipe,
} from '@nestjs/common'
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs'
import * as Swagger from '@nestjs/swagger'

import { randomStrSortable } from '../../../../../../shared/libs/random'

import { HttpErrorFilter } from '../../../../../../shared/filters/http-error.filter'
import { ZodErrorFilter } from '../../../../../../shared/filters/zod-error.filter'
import { GlobalErrorFilter } from '../../../../../../shared/filters/global-error.filter'

import { ZodValidationPipe } from '../../../../../../shared/pipes/zod-validation.pipe'

import { SwaggerInternalError } from '../../../../../../shared/decorators/swagger/swagger-internal-error.decorator'
import { SwaggerZodValidationResponse } from '../../../../../../shared/decorators/swagger/swagger-zod-validation-response.decorator'

import { ListCategoriesQuery } from '../../queries/list-categories.query'

import type { Category } from '../../../../domain/types/category.type'


@Swagger.ApiTags('Catalog:details - categories')
@Controller('catalog')
export class CategoriesDetailsController {
    constructor(
		private readonly commandBus: CommandBus,
		private readonly eventBus: EventBus,
		private readonly queryBus: QueryBus
	) {}
	
	@Swagger.ApiResponse({
        description: 'Get Categories',
        content: {
            'application/json': {
                example: {
                    success: true,
                    data: [
                        {
                            id: randomStrSortable(),
                            name: 'food',
                            is_active: true
                        },
                        {
                            id: randomStrSortable(),
                            name: 'drink',
                            is_active: true
                        },   
                        {
                            id: randomStrSortable(),
                            name: 'book',
                            is_active: true
                        },
                    ]
                }
            }
        }
	})
	@Swagger.ApiQuery({
        name: 'page',
        required: false,
        example: 1
	})
	@Swagger.ApiQuery({
        name: 'limit',
        required: false,
        example: 40
	})
	@Swagger.ApiQuery({
        name: 'ids',
        required: false,
        example: undefined
	})
	@Swagger.ApiQuery({
        name: 'search',
        required: false,
        example: 'makanan'
	})
	@Swagger.ApiQuery({
        name: 'sortOrder',
        required: false,
        example: 'asc'
	})
	@Swagger.ApiQuery({
        name: 'isActive',
        required: false,
        example: true
	})
	@SwaggerInternalError()
	@UseFilters(GlobalErrorFilter)
	@Get('categories')
	async getListCategories(
        @Query('page', ParseIntPipe) page: number | undefined = undefined,
        @Query('limit', ParseIntPipe) limit: number = 300,
        @Query('ids') ids: string | undefined = undefined,
        @Query('search') search: string | undefined = undefined,
        @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
        @Query('isActive') isActive: 'true' | 'false' | undefined = undefined
    ): Promise<object> {
        const result = await this.queryBus.execute<{
            data: {
                id: Category['id']
                name: Category['name']
                is_active: Category['isActive']
            }[],
            pagination: any
        }>(
            new ListCategoriesQuery(page, limit, ids, search, sortOrder, isActive)
        )
        
        return {
            success: true,
            pagination: result.pagination,
            data: result.data
        }
	}
	
	
	
	
}
