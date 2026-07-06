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
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs'

import { ZodValidationPipe } from '../../../../../../shared/pipes/zod-validation.pipe'

import { HttpErrorFilter } from '../../../../../../shared/filters/http-error.filter'
import { ZodErrorFilter } from '../../../../../../shared/filters/zod-error.filter'
import { GlobalErrorFilter } from '../../../../../../shared/filters/global-error.filter'

import { SwaggerInternalError } from '../../../../../../shared/decorators/swagger/swagger-internal-error.decorator'
import { SwaggerZodValidationResponse } from '../../../../../../shared/decorators/swagger/swagger-zod-validation-response.decorator'




@Swagger.ApiTags('Sales:main - transactions')
@Controller('sales')
export class TransactionsMainController {
    constructor(
        private readonly eventBus: EventBus,
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) {}
    
    
    
    
    @Post('transactions')
    async createTransaction(
        
    ): Promise<object> {
        
        
        
        
        return {
            success: true,
            data: true
        }
    }
    
    
    
}
