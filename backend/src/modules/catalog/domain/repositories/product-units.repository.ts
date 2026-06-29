import type { ProductId } from '../types/product.type'
import type {
	ProductUnit,
	CreateProductUnit,
	ProductUnitId,
	ProductUnitName,
} from '../types/product-unit.type'

export abstract class ProductUnitsRepository {
	abstract findUnits(id: ProductId): Promise<ProductUnit[]>
	abstract create(input: CreateProductUnit): Promise<ProductUnit>
	abstract existsById(
		id: ProductUnitId,
	): Promise<{ id: ProductUnitId; name: ProductUnitName } | undefined>
	abstract byId(id: ProductId): Promise<ProductUnit | undefined>
	abstract byName(id: ProductUnitName): Promise<ProductUnit | undefined>
}
