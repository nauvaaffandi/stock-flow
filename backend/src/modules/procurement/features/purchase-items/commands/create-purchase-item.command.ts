import { CreatePurchaseItemDto } from '../presentation/dto/create-purchase-item.dto'
import type { PurchaseId } from '../../../domain/types/purchases.type'
import type { PurchaseItem } from '../../../domain/types/purchase-item.type'
import { Command } from '@nestjs/cqrs'

export class CreatePurchaseItemCommand extends Command<PurchaseItem> {
	constructor(
		public readonly purchaseId: PurchaseId,
		public readonly dto: CreatePurchaseItemDto,
	) {
		super()
	}
}
