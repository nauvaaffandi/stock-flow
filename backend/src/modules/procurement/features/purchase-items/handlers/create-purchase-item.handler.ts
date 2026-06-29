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
} from '../../../../catalog'

@CommandHandler(CreatePurchaseItemCommand)
export class CreatePurchaseItemHandler implements ICommandHandler<CreatePurchaseItemCommand> {
	constructor(
		private readonly productService: ProductService,
		private readonly productUnitService: ProductUnitService,

		private readonly purchaseItemsRepo: PurchaseItemsRepository,
		private readonly purchasesRepo: PurchasesRepository,
	) {}

	async execute(command: CreatePurchaseItemCommand) {
		const { purchaseId, dto } = command

		const purchase = await this.purchasesRepo.existsById(purchaseId)

		if (!purchase) {
			throw new PurchaseNotFoundException(purchaseId)
		}

		const product = await this.productService.getProductById(dto.productId)

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
			productId: dto.productId,
			unitName: unit.data!.name,
			conversionFactor: unit.data!.conversionFactor,
			quantity: dto.quantity,
			quantityInBase: dto.quantity * unit.data!.conversionFactor,
			unitCost: dto.unitCost,
			subtotal: dto.quantity * dto.unitCost,
		})

		return result
	}
}
