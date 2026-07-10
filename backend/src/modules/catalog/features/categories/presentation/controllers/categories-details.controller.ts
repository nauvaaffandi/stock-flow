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

import { Identifier, IdentifierPrefix } from '@core/identifier'
import { ZodValidationPipe } from '../../../../../../shared/pipes/zod-validation.pipe'

import { SwaggerInternalError } from '../../../../../../shared/decorators/swagger/swagger-internal-error.decorator'
import { SwaggerZodValidationResponse } from '../../../../../../shared/decorators/swagger/swagger-zod-validation-response.decorator'

import { ListCategoriesQuery } from '../../queries/list-categories.query'

import type { Category, CategoryContract } from '../../../../domain/types/category.type'


@Swagger.ApiTags('Catalog - categories')
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
                    pagination: {
                        page: 1,
                        limit: 1,
                        search: 'dimsum',
                        sort_by: 'name',
                        sort_order: 'asc',
                        is_active: true,
                    },
                    data: [
                        {
                            id: Identifier.create(IdentifierPrefix.CATEGORY, 37),
                            name: 'food',
                            is_active: true
                        },
                        {
                            id: Identifier.create(IdentifierPrefix.CATEGORY, 97),
                            name: 'drink',
                            is_active: true
                        },   
                        {
                            id: Identifier.create(IdentifierPrefix.CATEGORY, 52),
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
	@Get('categories')
	async getListCategories(
        @Query('page', ParseIntPipe) page: number = 1,
        @Query('limit', ParseIntPipe) limit: number = 300,
        @Query('ids') ids: string | undefined = undefined,
        @Query('search') search: string | undefined = undefined,
        @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
        @Query('isActive') isActive: 'true' | 'false' | undefined = undefined
    ): Promise<object> {
        const result = await this.queryBus.execute<{
            data: {
                id: CategoryContract['id']
                name: CategoryContract['name']
                isActive: CategoryContract['isActive']
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
