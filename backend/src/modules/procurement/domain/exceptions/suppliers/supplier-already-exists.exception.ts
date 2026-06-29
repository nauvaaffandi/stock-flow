import type { SupplierCode } from '../../types/suppliers.type'

export class SupplierAlreadyExistsException extends Error {
	public static readonly code = 'SUPPLIER_ALREADY_EXISTS'
	public static readonly summary = 'Supplier already exists'
	private supplierCode: SupplierCode

	private static baseMessage(supplierCode: SupplierCode) {
		return `Supplier "${supplierCode}" already exists`
	}

	ApiResponse() {
		return {
			code: SupplierAlreadyExistsException.code,
			message: SupplierAlreadyExistsException.baseMessage(
				this.supplierCode,
			),
		}
	}

	static response(supplierCode: SupplierCode) {
		return {
			code: SupplierAlreadyExistsException.code,
			message: SupplierAlreadyExistsException.baseMessage(supplierCode),
		}
	}

	constructor(supplierCode: SupplierCode) {
		super(SupplierAlreadyExistsException.baseMessage(supplierCode))
		this.supplierCode = supplierCode
	}
}
