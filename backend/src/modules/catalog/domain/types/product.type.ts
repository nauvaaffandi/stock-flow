export interface Product {
	id: string
	categoryName?: string | null
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

export type GetProduct = Pick<
	Product,
	| 'id'
	| 'name'
	| 'sku'
	| 'barcode'
	| 'categoryName'
	| 'baseUnit'
	| 'costPrice'
	| 'sellingPrice'
	| 'isActive'
	| 'createdAt'
	| 'updatedAt'
>

export type ProductUniqueField = Pick<Product, 'name' | 'barcode' | 'sku'>

export type CreateProduct = Pick<
	Product,
	| 'categoryName'
	| 'name'
	| 'sku'
	| 'barcode'
	| 'baseUnit'
	| 'costPrice'
	| 'sellingPrice'
>
