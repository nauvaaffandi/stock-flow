import { Module } from '@nestjs/common'
import { DrizzleModule } from '../../infrastructure/drizzle/drizzle.module'

import { CategoriesRepository } from './domain/repositories/categories.repository'
import { ProductsRepository } from './domain/repositories/products.repository'
import { ProductUnitsRepository } from './domain/repositories/product-units.repository'
import { ProductUnitPricesRepository } from './domain/repositories/product-unit-prices.repository'

import { CategoriesRepositoryDrizzle } from './infrastructure/drizzle/repositories/categories-repository.drizzle'
import { ProductsRepositoryDrizzle } from './infrastructure/drizzle/repositories/products-repository.drizzle'
import { ProductUnitsRepositoryDrizzle } from './infrastructure/drizzle/repositories/product-units-repository.drizzle'
import { ProductUnitPricesRepositoryDrizzle } from './infrastructure/drizzle/repositories/product-unit-prices-repository.drizzle'

import { ProductUnitService } from './domain/interfaces/product-unit-service.abstract'
import { ProductUnitServiceImpl } from './application/services/product-unit-service.impl'

import { ProductService } from './domain/interfaces/product-service.abstract'
import { ProductServiceImpl } from './application/services/product-service.impl'

import { CreateCategoryHandler } from './features/categories/handlers/create-category.handler'
import { ListCategoriesHandler } from './features/categories/handlers/list-categories.handler'
import { CreateProductHandler } from './features/products/handlers/create-product.handler'
import { CreateProductUnitHandler } from './features/product-units/handlers/create-product-unit.handler'
import { CreateProductUnitPriceHandler } from './features/product-unit-prices/handlers/create-product-unit-price.handler'

import { CategoriesMainController } from './features/categories/presentation/controllers/categories-main.controller'
import { ProductsMainController } from './features/products/presentation/controllers/products-main.controller'
import { ProductUnitsMainController } from './features/product-units/presentation/controllers/product-units-main.controller'
import { ProductUnitPricesMainController } from './features/product-unit-prices/presentation/controllers/product-unit-prices-main.controller'
import { CategoriesDetailsController } from './features/categories/presentation/controllers/categories-details.controller';

@Module({
	imports: [DrizzleModule],
	providers: [
		{
			provide: CategoriesRepository,
			useClass: CategoriesRepositoryDrizzle,
		},
		{
			provide: ProductsRepository,
			useClass: ProductsRepositoryDrizzle,
		},
		{
			provide: ProductUnitsRepository,
			useClass: ProductUnitsRepositoryDrizzle,
		},
		{
			provide: ProductUnitPricesRepository,
			useClass: ProductUnitPricesRepositoryDrizzle,
		},

		{
			provide: ProductService,
			useClass: ProductServiceImpl,
		},
		{
			provide: ProductUnitService,
			useClass: ProductUnitServiceImpl,
		},

		CategoriesRepositoryDrizzle,
		ProductsRepositoryDrizzle,
		ProductUnitsRepositoryDrizzle,
		ProductUnitPricesRepositoryDrizzle,

		CreateCategoryHandler,
		ListCategoriesHandler,
		CreateProductHandler,
		CreateProductUnitHandler,
		CreateProductUnitPriceHandler,
	],
	controllers: [
		CategoriesMainController,
		ProductsMainController,
		ProductUnitsMainController,
		ProductUnitPricesMainController,
		CategoriesDetailsController,
	],
	exports: [ProductService, ProductUnitService],
})
export class CatalogModule {}
