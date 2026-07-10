import { CreateSupplierDto } from '../presentation/dto/create-supplier.dto'
import { Command } from '@nestjs/cqrs'
import type { SupplierContract } from '../../../domain/types/suppliers.type'

export class CreateSupplierCommand extends Command<SupplierContract> {
	constructor(
        public readonly dto: CreateSupplierDto
    ) {
        super()
	}
}
