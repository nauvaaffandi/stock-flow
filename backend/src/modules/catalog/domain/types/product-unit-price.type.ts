import type { ProductId } from './product.type'
import type { ProductUnitId } from './product-unit.type'

export interface ProductUnitPrice {
	id: number
	productId: ProductId
	unitId: ProductUnitId
	sellingPrice: number
	isActive: boolean
	createdAt?: Date
	updatedAt?: Date
}

export type ProductUnitPriceId = ProductUnitPrice['id']
export type ProductUnitPriceSellingPrice = ProductUnitPrice['sellingPrice']

export type CreateProductUnitPrice = Pick<
	ProductUnitPrice,
	'productId' | 'unitId' | 'sellingPrice'
>
