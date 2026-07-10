import type { Replace } from '../../../../types/utilities/replace'


export interface Supplier {
	id: number
	name: string
	code: string
	phone: string | null
	address: string | null
	isActive: boolean
	createdAt?: Date
	updatedAt?: Date
}

export type SupplierId = Supplier['id']
export type SupplierName = Supplier['name']
export type SupplierCode = Supplier['code']

export type CreateSupplier = Pick<
	Supplier,
	'name' | 'code' | 'phone' | 'address'
>


export type SupplierRequest = Omit<
    Supplier,
    | 'id'
    | 'isActive'
    | 'createdAt'
    | 'updatedAt'
> & {
    id: string 
}

export type SupplierContract = Replace<Supplier, {
    id: string 
}>


