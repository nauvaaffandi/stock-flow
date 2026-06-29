import { CreateSupplierDto } from '../presentation/dto/create-supplier.dto'

export class CreateSupplierCommand {
	constructor(public readonly dto: CreateSupplierDto) {}
}
