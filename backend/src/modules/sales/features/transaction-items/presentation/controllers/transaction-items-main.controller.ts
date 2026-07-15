import {
	Controller,
	Post,
	Body,
	UseFilters,
	Param,
	ConflictException,
} from '@nestjs/common'
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs'
import * as Swagger from '@nestjs/swagger'
import { Identifier, IdentifierPrefix } from '@core/identifier'

import { SwaggerInternalError } from '@shared/decorators/swagger/swagger-internal-error.decorator'
import { SwaggerZodValidationResponse } from '@shared/decorators/swagger/swagger-zod-validation-response.decorator'

import { ZodValidationPipe } from '@shared/pipes/zod-validation.pipe'
import { CreateTransactionItemZodValidation } from '../validation/create-transaction-item.zod.validation'

import { CreateTransactionItemDto } from '../dto/create-transaction-item.dto'

import { CreateTransactionItemCommand } from '../../commands/create-transaction-item.command'

import type { TransactionContract } from '../../../../domain/types/transactions.type'

@SwaggerInternalError()
@SwaggerZodValidationResponse()
@Swagger.ApiTags('Sales - transaction items')
@Controller('sales')
export class TransactionItemsMainController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus
    ) {}


    
    @Post('transactions/:transactionId/items')
    async createTransactionItem(
        @Param('transactionId') transactionId: TransactionContract['id'],
        @Body(new ZodValidationPipe(CreateTransactionItemZodValidation)) dto: CreateTransactionItemDto
    ): Promise<object> {
        const result = await this.commandBus.execute(
            new CreateTransactionItemCommand(transactionId, dto)
        )
        
        return {
            success: true,
            data: result,
        }
    }
}

