import type { SupplierCode } from '../../types/suppliers.type'

export class SupplierNotFoundException extends Error {
	public static readonly code = 'SUPPLIER_NOT_FOUND'
	public static readonly summary = 'Supplier not found'
	private supplierCode: SupplierCode

	private static baseMessage(supplierCode: SupplierCode) {
		return `Supplier "${supplierCode}" not found`
	}

	ApiResponse() {
		return {
			code: SupplierNotFoundException.code,
			message: SupplierNotFoundException.baseMessage(this.supplierCode),
		}
	}

	static response(supplierCode: SupplierCode) {
		return {
			code: SupplierNotFoundException.code,
			message: SupplierNotFoundException.baseMessage(supplierCode),
		}
	}

	constructor(supplierCode: SupplierCode) {
		super(SupplierNotFoundException.baseMessage(supplierCode))
		this.supplierCode = supplierCode
	}
}
