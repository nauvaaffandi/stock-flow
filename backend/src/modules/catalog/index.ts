export type {
	Product,
	ProductId,
	CreateProduct,
	ProductUniqueField,
	ProductContract,
} from './domain/types/product.type'
export type {
	ProductUnit,
	ProductUnitId,
	ProductUnitName,
	CreateProductUnit,
	ProductUnitContract,
	ProductUnitConversionFactor,
} from './domain/types/product-unit.type'
export type {
	Category,
	CategoryId,
	CategoryName,
	CategoryContract,
} from './domain/types/category.type'
export type {
	ProductUnitPrice,
	ProductUnitPriceId,
	CreateProductUnitPrice,
	ProductUnitPriceContract,
	ProductUnitPriceSellingPrice,
} from './domain/types/product-unit-price.type'

export { ProductService } from './domain/interfaces/product-service.abstract'
export { ProductUnitService } from './domain/interfaces/product-unit-service.abstract'

export { CategoriesRepository } from './domain/repositories/categories.repository'
export { ProductsRepository } from './domain/repositories/products.repository'
export { ProductUnitsRepository } from './domain/repositories/product-units.repository'
export { ProductUnitPricesRepository } from './domain/repositories/product-unit-prices.repository'

export { ProductNotFoundException } from './domain/exceptions/products/product-not-found.exception'
export { ProductUnitNotFoundException } from './domain/exceptions/product-units/product-unit-not-found.exception'
export { CategoryAlreadyExistsException } from './domain/exceptions/categories/category-already-exists.exception'
export { CategoryNotFoundException } from './domain/exceptions/categories/category-not-found.exception'
export { ProductAlreadyExistsException } from './domain/exceptions/products/product-already-exists.exception'
export { ProductUnitPriceAlreadyExistsException } from './domain/exceptions/product-unit-prices/product-unit-price-already-exists.exception'

export { CategoryCreatedEvent } from './domain/events/category-created.event'
export { ProductCreatedEvent } from './domain/events/product-created.event'
