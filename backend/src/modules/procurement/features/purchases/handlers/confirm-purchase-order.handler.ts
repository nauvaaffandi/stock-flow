import { ConfirmPurchaseOrderCommand } from '../commands/confirm-purchase-order.command'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { PurchasesRepository } from '../../../domain/repositories/purchases.repository'
import { PurchaseItemsRepository } from '../../../domain/repositories/puchase-items.repository'

import { PurchaseNotFoundException } from '../../../domain/exceptions/purchases/purchase-not-found.exception'

import { Identifier, IdentifierPrefix } from '../../../../../shared/utils/identifier'

@CommandHandler(ConfirmPurchaseOrderCommand)
export class ConfirmPurchaseOrderHandler implements ICommandHandler<ConfirmPurchaseOrderCommand> {
	constructor(
		private readonly purchasesRepo: PurchasesRepository,
		private readonly purchaseItemsRepo: PurchaseItemsRepository,
	) {}

	async execute(command: ConfirmPurchaseOrderCommand) {
        const purchaseId = Identifier.parse(command.purchaseId).id
        
		const purchase = await this.purchasesRepo.existsById(purchaseId)
        
		if (!purchase) {
			throw new PurchaseNotFoundException(command.purchaseId)
		}
        
		const purchaseItems = await this.purchaseItemsRepo.getsById(purchaseId)
        
		let totalCost: number = 0
        
		for (const item of purchaseItems) {
			totalCost = totalCost + item.subtotal
		}
        
		const result = await this.purchasesRepo.confirmPurchase({
			purchaseId,
			totalCost,
		})
        
		return result
	}
}
