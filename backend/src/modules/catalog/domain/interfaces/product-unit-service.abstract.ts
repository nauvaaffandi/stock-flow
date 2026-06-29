import type {
	ProductUnitId,
	ProductUnitName,
	ProductUnit,
} from '../types/product-unit.type'

export abstract class ProductUnitService {
	abstract getProductUnitById(id: ProductUnitId): Promise<{
		found: boolean
		data?: ProductUnit
	}>
	abstract getProductUnitByName(name: ProductUnitName): Promise<{
		found: boolean
		data?: ProductUnit
	}>
}
