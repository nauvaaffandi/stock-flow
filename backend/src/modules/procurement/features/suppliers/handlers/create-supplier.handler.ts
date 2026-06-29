import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CreateSupplierCommand } from '../commands/create-supplier.command'
import { SuppliersRepository } from '../../../domain/repositories/suppliers.repository'
import { SupplierAlreadyExistsException } from '../../../domain/exceptions/suppliers/supplier-already-exists.exception'

@CommandHandler(CreateSupplierCommand)
export class CreateSupplierHandler implements ICommandHandler<CreateSupplierCommand> {
	constructor(private readonly suppliersRepo: SuppliersRepository) {}

	async execute(command: CreateSupplierCommand) {
		const { dto } = command

		const supplier = await this.suppliersRepo.existsByCode(dto.code)

		if (supplier) {
			throw new SupplierAlreadyExistsException(dto.code)
		}

		const result = await this.suppliersRepo.create(dto)

		return result
	}
}
