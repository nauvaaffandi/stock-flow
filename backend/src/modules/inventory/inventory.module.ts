import { Module } from '@nestjs/common'
import { DrizzleModule } from '../../infrastructure/drizzle/drizzle.module'

import { StockMovementAbstract } from './domain/interfaces/stock-movement.abstract'
import { StockMovementService } from './application/services/stock-movement.service'

@Module({
    imports: [DrizzleModule],
    providers: [
        {
            provide: StockMovementAbstract,
            useClass: StockMovementService,
        },
        
        StockMovementService,
    ],
})
export class InventoryModule {}
    