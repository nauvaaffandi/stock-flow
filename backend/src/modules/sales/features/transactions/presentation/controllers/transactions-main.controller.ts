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
import { CreateTransactionsZodValidation } from '../validation/create-transactions.zod'

import { HttpErrorFilter } from '../../../../../../shared/filters/http-error.filter'
import { ZodErrorFilter } from '../../../../../../shared/filters/zod-error.filter'
import { GlobalErrorFilter } from '../../../../../../shared/filters/global-error.filter'

import { SwaggerInternalError } from '../../../../../../shared/decorators/swagger/swagger-internal-error.decorator'
import { SwaggerZodValidationResponse } from '../../../../../../shared/decorators/swagger/swagger-zod-validation-response.decorator'

import { CreateTransactionDto } from '../dto/create-transaction.dto'

import { CreateTransactionCommand } from '../../commands/create-transaction.command'

import { Identifier, IdentifierPrefix } from '../../../../../../shared/utils/identifier'

import type { TransactionContract } from '../../../../domain/types/transactions.type'

@Swagger.ApiTags('Sales:main - transactions')
@Controller('sales')
export class TransactionsMainController {
    constructor(
        private readonly eventBus: EventBus,
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) {}
    
    
    
    @SwaggerZodValidationResponse()
    @SwaggerInternalError()
    @Swagger.ApiCreatedResponse({
        description: 'successfully create transaction',
        content: {
            'application/json': {
                example: {
                    success: true,
                    data: {
                        id: Identifier.create(IdentifierPrefix.TRANSACTION, 2937),
                        type: "SALE",
                        total_amount: 0,
                        total_items: 0,
                        notes: "example notes",
                        created_at: "2026-07-06T15:05:02.841Z"
                    }
                }
            }
        }
    })
    @Post('transactions')
    async createTransaction(
        @Body(new ZodValidationPipe(CreateTransactionsZodValidation)) dto: CreateTransactionDto
    ): Promise<object> {
        const result = await this.commandBus.execute<TransactionContract>(
            new CreateTransactionCommand(dto)
        )
        
        
        return {
            success: true,
            data: result
        }
    }
    
    
    
}
