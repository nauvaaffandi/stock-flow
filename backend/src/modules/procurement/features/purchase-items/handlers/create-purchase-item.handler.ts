import { CreatePurchaseItemCommand } from '../commands/create-purchase-item.command'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { PurchasesRepository } from '../../../domain/repositories/purchases.repository'
import { PurchaseItemsRepository } from '../../../domain/repositories/puchase-items.repository'
import { PurchaseNotFoundException } from '../../../domain/exceptions/purchases/purchase-not-found.exception'
import {
	ProductService,
	ProductUnitService,
	ProductNotFoundException,
	ProductUnitNotFoundException,
} from '@modules/catalog'
import type { PurchaseItemContract } from '../../../domain/types/purchase-item.type' 
import { Identifier, IdentifierPrefix } from '@core/identifier'
@CommandHandler(CreatePurchaseItemCommand)
export class CreatePurchaseItemHandler implements ICommandHandler<CreatePurchaseItemCommand> {
	constructor(
		private readonly productService: ProductService,
		private readonly productUnitService: ProductUnitService,

		private readonly purchaseItemsRepo: PurchaseItemsRepository,
		private readonly purchasesRepo: PurchasesRepository,
	) {}

	async execute(command: CreatePurchaseItemCommand): Promise<PurchaseItemContract> {
		const { dto } = command
        
        const purchaseId = Identifier.parse(command.purchaseId).id
		const purchase = await this.purchasesRepo.existsById(purchaseId)
		if (!purchase) {
			throw new PurchaseNotFoundException(command.purchaseId)
		}
        
        const productId = Identifier.parse(dto.productId).id
		const product = await this.productService.getProductById(productId)
		if (!product.found) {
			throw new ProductNotFoundException(dto.productId)
		}
        
		const unit = await this.productUnitService.getProductUnitByName(
			dto.unitName,
		)
        
		if (!unit.found) {
			throw new ProductUnitNotFoundException(dto.unitName)
		}
        
		const result = await this.purchaseItemsRepo.create({
			purchaseId,
			productId,
			unitName: unit.data!.name,
			conversionFactor: unit.data!.conversionFactor,
			quantity: dto.quantity,
			quantityInBase: dto.quantity * unit.data!.conversionFactor,
			unitCost: dto.unitCost,
			subtotal: dto.quantity * dto.unitCost,
		})
        
		return {
            ...result,
            id: Identifier.create( IdentifierPrefix.PURCHASE_ITEM, result.id),
            productId: Identifier.create( IdentifierPrefix.PURCHASE_ITEM, result.productId),
            purchaseId: Identifier.create( IdentifierPrefix.PURCHASE_ITEM, result.purchaseId),
		}
	}
}
