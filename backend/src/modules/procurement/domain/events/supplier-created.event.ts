import type { SupplierContract } from '../types/suppliers.type'

export class SupplierCreatedEvent {
	constructor(
		public readonly id: SupplierContract['id'],
		public readonly name: SupplierContract['name'],
		public readonly code: SupplierContract['code'],
	) {}
}
