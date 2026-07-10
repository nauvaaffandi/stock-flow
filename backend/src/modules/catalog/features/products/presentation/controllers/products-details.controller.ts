import {
	Controller,
	Post,
	Body,
	UseFilters,
	Query,
	ParseIntPipe,
	Get,
	ConflictException,
} from '@nestjs/common'
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs'
import * as Swagger from '@nestjs/swagger'

import { randomStrSortable } from '../../../../../../shared/libs/random'

import { ZodValidationPipe } from '../../../../../../shared/pipes/zod-validation.pipe'
import { CreateProductZodValidation } from '../validation/create-product.zod'

import { SwaggerInternalError } from '../../../../../../shared/decorators/swagger/swagger-internal-error.decorator'
import { SwaggerZodValidationResponse } from '../../../../../../shared/decorators/swagger/swagger-zod-validation-response.decorator'

import { GetProductsQuery } from '../../queries/get-products.query'

import { Identifier, IdentifierPrefix } from '../../../../../../shared/utils/identifier'

import type { ProductContract } from '../../../../domain/types/product.type'



@Swagger.ApiTags('Catalog - products')
@Controller('catalog')
export class ProductsDetailsController {
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
                        limit: 40,
                        search: 'dimsum',
                        sort_by: 'name',
                        sort_order: 'asc',
                        is_active: true,
                    },
                    data: [
                        {
                            id: Identifier.create(IdentifierPrefix.PRODUCT, 38),
                            category_id: Identifier.create(IdentifierPrefix.CATEGORY, 38),
                            name: 'Dimsum daging tikus',
                            sku: 'SUB/DEV/XYZ',
                            barcode: '9285762937',
                            baseUnit: 'pack',
                            cost_price: 20000,
                            selling_price: 22000,
                            is_active: true,
                            created_at: new Date(),
                            updated_at: new Date(),   
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
        name: 'sortBy',
        required: false,
        example: 'name',
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
	@Get('products')
	async getListCategories(
        @Query('page', ParseIntPipe) page: number = 1,
        @Query('limit', ParseIntPipe) limit: number = 300,
        @Query('ids') ids: string | undefined = undefined,
        @Query('search') search: string | undefined = undefined,
        @Query('sortBy') sortBy: string | undefined = undefined,
        @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
        @Query('isActive') isActive: 'true' | 'false' | undefined = undefined
    ): Promise<object> {
        const result = await this.queryBus.execute<{
            data: ProductContract[],
            pagination: any
        }>(
            new GetProductsQuery(page, limit, ids, search, sortBy, sortOrder, isActive)
        )
        
        return {
            success: true,
            pagination: result.pagination,
            data: result.data,
        }
	}
    
}
