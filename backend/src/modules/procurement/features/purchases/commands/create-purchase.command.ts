import { CreatePurchaseDto } from '../presentation/dto/create-purchase.dto'
import { Command } from '@nestjs/cqrs'
import type { PurchaseContract } from '../../../domain/types/purchases.type'

export class CreatePurchaseCommand extends Command<PurchaseContract> {
	constructor(
        public readonly dto: CreatePurchaseDto
    ) {
        super()
    }
}
