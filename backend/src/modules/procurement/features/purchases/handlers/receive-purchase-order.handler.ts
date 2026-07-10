import { ReceivePurchaseOrderCommand } from '../commands/receive-purchase-order.command'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ConflictException } from '@nestjs/common'

import { PurchasesRepository } from '../../../domain/repositories/purchases.repository'
import { PurchaseItemsRepository } from '../../../domain/repositories/puchase-items.repository'

import { PurchaseNotFoundException } from '../../../domain/exceptions/purchases/purchase-not-found.exception'

import { PurchaseStatusSpecification } from '../../../domain/specification/purchase.specification'

import { Identifier, IdentifierPrefix } from '../../../../../shared/utils/identifier'

@CommandHandler(ReceivePurchaseOrderCommand)
export class ReceivePurchaseOrderHandler
    implements ICommandHandler<ReceivePurchaseOrderCommand>
{
    constructor(
		private readonly purchasesRepo: PurchasesRepository,
		private readonly purchaseItemsRepo: PurchaseItemsRepository,
	) {}
    
    
    async execute(command: ReceivePurchaseOrderCommand) {
        const purchaseId = Identifier.parse(command.purchaseId).id
		const exists = await this.purchasesRepo.existsById(purchaseId)
        
		if (!exists) {
			throw new PurchaseNotFoundException(command.purchaseId)
		}
		
		const purchase = await this.purchasesRepo.checkStatus(purchaseId)
		
		const statusSpec = new PurchaseStatusSpecification()
		
		if(statusSpec.isReceived(purchase.status)) {
            throw new ConflictException({
                code: 'PURCHASE_STATUS_ALREADY_RECEIVED',
                message: 'Purchase status already received'
            })
		}
		
		const result = await this.purchasesRepo.receivePurchase(purchaseId)
		
		return {
            ...result,
            id: Identifier.create( IdentifierPrefix.PURCHASE, result.id)
		}
    }
}


