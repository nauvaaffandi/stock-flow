import { Module } from '@nestjs/common'

import { DrizzleModule } from '../../infrastructure/drizzle'
import { CatalogModule } from '../catalog/catalog.module'

import { PurchasesRepositoryDrizzle } from './infrastructure/drizzle/repositories/purchases-repository.drizzle'
import { SuppliersRepositoryDrizzle } from './infrastructure/drizzle/repositories/suppliers-repository.drizzle'
import { PurchaseItemsRepositoryDrizzle } from './infrastructure/drizzle/repositories/purchase-items-repository.drizzle'

import { SuppliersRepository } from './domain/repositories/suppliers.repository'
import { PurchasesRepository } from './domain/repositories/purchases.repository'
import { PurchaseItemsRepository } from './domain/repositories/puchase-items.repository'

import { CreateSupplierHandler } from './features/suppliers/handlers/create-supplier.handler'
import { CreatePurchaseHandler } from './features/purchases/handlers/create-purchase.handler'
import { CreatePurchaseItemHandler } from './features/purchase-items/handlers/create-purchase-item.handler'

import { PurchasesMainController } from './features/purchases/presentation/controllers/purchases-main.controller'
import { SuppliersMainController } from './features/suppliers/presentation/controllers/suppliers-main.controller'
import { PurchaseItemsMainController } from './features/purchase-items/presentation/controllers/purchase-items-main.controller'
import { PurchasesActionController } from './features/purchases/presentation/controllers/purchases-action.controller'

@Module({
	imports: [DrizzleModule, CatalogModule],
	providers: [
		{
			provide: SuppliersRepository,
			useClass: SuppliersRepositoryDrizzle,
		},
		{
			provide: PurchasesRepository,
			useClass: PurchasesRepositoryDrizzle,
		},
		{
			provide: PurchaseItemsRepository,
			useClass: PurchaseItemsRepositoryDrizzle,
		},

		SuppliersRepositoryDrizzle,
		PurchasesRepositoryDrizzle,
		PurchaseItemsRepositoryDrizzle,

		CreateSupplierHandler,
		CreatePurchaseHandler,
		CreatePurchaseItemHandler,
	],
	controllers: [
		PurchasesMainController,
		SuppliersMainController,
		PurchaseItemsMainController,
		PurchasesActionController,
	],
})
export class ProcurementModule {}
