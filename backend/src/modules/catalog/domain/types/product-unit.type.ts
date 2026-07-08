import type { ProductId } from './product.type'

export interface ProductUnit {
	id: number
	productId: ProductId
	name: string
	conversionFactor: number
	isBaseUnit: boolean
}

export type ProductUnitId = ProductUnit['id']
export type ProductUnitName = ProductUnit['name']
export type ProductUnitConversionFactor = ProductUnit['conversionFactor']
export type ProductUnitIsBaseUnit = ProductUnit['isBaseUnit']

export type CreateProductUnit = Pick<
	ProductUnit,
	'productId' | 'name' | 'conversionFactor' | 'isBaseUnit'
>
