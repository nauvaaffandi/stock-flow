import { Module } from '@nestjs/common'
import { DrizzleModule } from '../../infrastructure/drizzle/drizzle.module'

import { StockMovementAbstract } from './domain/interfaces/stock-movement.abstract'
import { StockMovementService } from './application/services/stock-movement.service'

import { StockMovementRepository } from './domain/repositories/stock-movement.repository'
import { StockMovementRepositoryDrizzle } from './infrastructure/drizzle/repositories/stock-movement-repository.drizzle'

@Module({
    imports: [DrizzleModule],
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
    ],
})
export class InventoryModule {}
    