import {
	Controller,
	Post,
	Body,
	UseFilters,
	Get,
	Patch,
	Delete,
	Param,
	HttpCode,
	HttpStatus,
	ConflictException,
	NotFoundException,
} from '@nestjs/common'
import * as Swagger from '@nestjs/swagger'
import { CommandBus, EventBus } from '@nestjs/cqrs'

import { randomStrSortable } from '../../../../../../shared/libs/random'
import { todayFormatted } from '../../../../../../shared/libs/day-utils'

import { ZodValidationPipe } from '../../../../../../shared/pipes/zod-validation.pipe'

import { PurchaseNotFoundErrorFilter } from '../../../../../../shared/filters/purchases/purchase-not-found.filter'

import { SwaggerZodValidationResponse } from '../../../../../../shared/decorators/swagger/swagger-zod-validation-response.decorator'
import { SwaggerInternalError } from '../../../../../../shared/decorators/swagger/swagger-internal-error.decorator'
import { SwaggerPurchaseNotFound } from '../../../../../../shared/decorators/swagger/purchases/swagger-purchase-not-found.decorator'

import { ConfirmPurchaseOrderCommand } from '../../commands/confirm-purchase-order.command'
import { ReceivePurchaseOrderCommand } from '../../commands/receive-purchase-order.command'

import { CreateStockMovementFromPurchaseEvent } from '../../../../../inventory'

import type { 
    PurchaseId ,
    PurchaseReferenceNumber,
    PurchaseStatus,
    PurchaseContract,
} from '../../../../domain/types/purchases.type'

@Swagger.ApiTags('Procurement - purchases')
@Controller('procurement')
export class PurchasesActionController {
	constructor(
		private readonly eventBus: EventBus,
		private readonly commandBus: CommandBus,
	) {}

	@Swagger.ApiCreatedResponse({
		description: 'Successfully changes status',
		content: {
			'application/json': {
				example: {
					success: true,
					data: {
						reference_number: '#INV/1945/08/17/JWND83h3',
						total_cost: 29373828277,
						status: 'CONFIRMED',
					},
				},
			},
		},
	})
	@SwaggerPurchaseNotFound.single()
	@Swagger.ApiParam({
		required: true,
		example: randomStrSortable(),
		name: 'purchaseId',
		description: 'Id of purchase',
	})
	@UseFilters(
		PurchaseNotFoundErrorFilter,
	)
	@HttpCode(HttpStatus.OK)
	@Patch('purchases/:purchaseId/confirm')
	async confirmPurchaseOrder(
        @Param('purchaseId') purchaseId: PurchaseContract['id']
    ) {
		const result = await this.commandBus.execute(
			new ConfirmPurchaseOrderCommand(purchaseId),
		)
        
		return {
			success: true,
			data: result
		}
	}
	
	
	
	
	@Swagger.ApiResponse({
        description: 'Successfully update purchase.status',
        content: {
            'application/json': {
                example: {
                    success: true,
                    data: {
                        id: randomStrSortable(),
                        total_cost: 666666666,
                        status: 'RECEIVED',
                        reference_number: `#INV/${todayFormatted}/${randomStrSortable(8)}`,
                    }
                }
            }
        }
	})
	@Swagger.ApiConflictResponse({
        description: 'Conflict',
        content: {
            'application/json': {
                example: {
                    success: false,
                    errors: {
                        code: 'PURCHASE_STATUS_ALREADY_RECEIVED',
                        message: 'Purchase status already received'
                    }
                }
            }
        }
	})
	@SwaggerPurchaseNotFound.single()
	@Swagger.ApiParam({
		required: true,
		example: randomStrSortable(),
		name: 'purchaseId',
		description: 'Id of purchase',
	})
	@UseFilters(
		PurchaseNotFoundErrorFilter,
	)
	@HttpCode(HttpStatus.OK)
	@Patch('purchases/:purchaseId/receive')
	async receivePurchaseOrder(
        @Param('purchaseId') purchaseId: PurchaseContract['id']
    ) {
        const result = await this.commandBus.execute<{
            id: PurchaseContract['id']
            total_cost: PurchaseContract['totalCost']
            status: PurchaseContract['status']
            reference_number: PurchaseContract['referenceNumber']
        }>(
            new ReceivePurchaseOrderCommand(purchaseId)
        )
        
        this.eventBus.publish(
            new CreateStockMovementFromPurchaseEvent(purchaseId)
        )
        
        return {
            success: true,
            data: result
        }
	}
}
