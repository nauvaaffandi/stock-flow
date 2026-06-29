import { CreatePurchaseDto } from '../presentation/dto/create-purchase.dto'

export class CreatePurchaseCommand {
	constructor(public readonly dto: CreatePurchaseDto) {}
}
