import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CreatePurchaseCommand } from '../commands/create-purchase.command'
import { PurchasesRepository } from '../../../domain/repositories/purchases.repository'
import { SuppliersRepository } from '../../../domain/repositories/suppliers.repository'
import { SupplierNotFoundException } from '../../../domain/exceptions/suppliers/supplier-not-found.exception'
import { todayFormatted } from '../../../../../shared/libs/day-utils'
import { nanoid } from 'nanoid'
import { Identifier, IdentifierPrefix } from '../../../../../shared/utils/identifier'

@CommandHandler(CreatePurchaseCommand)
export class CreatePurchaseHandler implements ICommandHandler<CreatePurchaseCommand> {
	constructor(
		private readonly purchasesRepo: PurchasesRepository,
		private readonly suppliersRepo: SuppliersRepository,
	) {}

	async execute(command: CreatePurchaseCommand) {
		const { dto } = command
        
        const supplierId = Identifier.parse(dto.supplierId)
        
		const supplier = await this.suppliersRepo.existsById(supplierId.id)
        
		if (!supplier) {
			throw new SupplierNotFoundException(dto.supplierId)
		}
        
		const referenceNumber = `#INV/${todayFormatted}/${nanoid(10)}`
        
		const result = await this.purchasesRepo.create({
			...dto,
			supplierId: supplierId.id,
			referenceNumber,
		})
        
		return result
	}
}
