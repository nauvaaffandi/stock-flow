import { CreatePurchaseItemDto } from '../presentation/dto/create-purchase-item.dto'
import type { PurchaseContract } from '../../../domain/types/purchases.type'
import type { PurchaseItemContract } from '../../../domain/types/purchase-item.type'
import { Command } from '@nestjs/cqrs'

export class CreatePurchaseItemCommand extends Command<PurchaseItemContract> {
	constructor(
		public readonly purchaseId: PurchaseContract['id'],
		public readonly dto: CreatePurchaseItemDto,
	) {
		super()
	}
}


