import { Module } from '@nestjs/common'
import { DrizzleModule } from '../../infrastructure/drizzle/drizzle.module'
import { ProcurementModule } from '../procurement/procurement.module'

import { StockMovementAbstract } from './domain/interfaces/stock-movement.abstract'
import { StockMovementService } from './application/services/stock-movement.service'

import { StockMovementRepository } from './domain/repositories/stock-movement.repository'
import { StockMovementRepositoryDrizzle } from './infrastructure/drizzle/repositories/stock-movement-repository.drizzle'

import { CreateStockMovementFromPurchaseEventHandler } from './features/stock-movements/handlers/create-stock-movement-from-purchase-event.handler'

@Module({
    imports: [DrizzleModule, ProcurementModule],
    providers: [
        {
            provide: StockMovementAbstract,
            useClass: StockMovementService,
        },
        {
            provide: StockMovementRepository,
            useClass: StockMovementRepositoryDrizzle,
        },
        StockMovementRepositoryDrizzle,
        
        StockMovementService,
        
        CreateStockMovementFromPurchaseEventHandler,
    ],
})
export class InventoryModule {}
    