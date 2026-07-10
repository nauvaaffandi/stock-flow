import type {
	Supplier,
	SupplierId,
	SupplierName,
	SupplierCode,
	CreateSupplier,
} from '../types/suppliers.type'

export abstract class SuppliersRepository {
	abstract findByName(name: SupplierName): Promise<Supplier[]>
	abstract create(input: CreateSupplier): Promise<Supplier>
	abstract findByCode(code: SupplierCode): Promise<Supplier[]>
	abstract existsByCode(code: SupplierCode): Promise<
		| {
				id: SupplierId
				code: SupplierCode
				name: SupplierName
		  }
		| undefined
	>
	abstract existsById(code: SupplierId): Promise<
		| {
				id: SupplierId
				code: SupplierCode
				name: SupplierName
		  }
		| undefined
	>
}
