export interface Product {
	id: number
	categoryId?: string | null
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
	| 'categoryId'
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
	| 'categoryId'
	| 'name'
	| 'sku'
	| 'barcode'
	| 'baseUnit'
	| 'costPrice'
	| 'sellingPrice'
>


export interface ProductResponse extends Omit<Product, 
    | 'id'
    | 'categoryId'
> {
    id: string
    categoryId: string
}

