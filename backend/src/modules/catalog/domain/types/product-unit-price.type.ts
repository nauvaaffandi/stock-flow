import type { ProductId } from './product.type'
import type { ProductUnitId } from './product-unit.type'
import type { Replace } from '../../../../types/utilities/replace'

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



export type ProductUnitPriceContract = Replace<ProductUnitPrice, {
    id: string
    productId: string
    unitId: string
}>
