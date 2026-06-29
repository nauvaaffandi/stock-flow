import type {
	SupplierId,
	SupplierCode,
	SupplierName,
} from '../types/suppliers.type'

export class SupplierCreatedEvent {
	constructor(
		public readonly id: SupplierId,
		public readonly namr: SupplierName,
		public readonly code: SupplierCode,
	) {}
}
