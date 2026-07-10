import type { Replace } from '../../../../types/utilities/replace'


export interface Product {
	id: number
	categoryId?: number | null
	name: string
	sku: string
	barcode: string
	baseUnit: string
	costPrice: number
	sellingPrice: number
	isActive?: boolean
	createdAt?: Date
	updatedAt?: Date
}

export type ProductId = Product['id']
export type ProductName = Product['name']
export type ProductSku = Product['sku']
export type ProductBarcode = Product['barcode']
export type ProductBaseUnit = Product['baseUnit']
export type ProductCostPrice = Product['costPrice']
export type ProductSellingPrice = Product['sellingPrice']

export type ProductUniqueField = Pick<Product, 'name' | 'barcode' | 'sku'>

export type CreateProduct = Pick<
	Product,
	| 'categoryId'
	| 'name'
	| 'sku'
	| 'barcode'
	| 'baseUnit'
	| 'costPrice'
	| 'sellingPrice'
>


export type ProductContract = Replace<Product, {
    id: string
    categoryId: string | null
}>

