import { StockMovementRepository } from '../../../domain/repositories/stock-movement.repository'
import { Injectable } from '@nestjs/common'
import { stockMovements } from '../schema'
import { ConnectionService } from '../../../../../infrastructure/drizzle'
import { ilike, inArray, eq, and, isNull, or, lt, asc, desc, sql, count } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import type { Database } from '../../../../../infrastructure/drizzle'

import type { StockMovementId, CreateStockMovement } from '../../../domain/types/stock-movement'

@Injectable()
export class StockMovementRepositoryDrizzle
    implements StockMovementRepository
{
    private db: Database
    
    constructor(private readonly connection: ConnectionService) {
        this.db = connection.client
    }
    
    
    async existsById(id: StockMovementId): Promise<{
        id:StockMovementId
    } | undefined> {
        const result = await this.db
            .select({
                id: stockMovements.id
            })
            .from(stockMovements)
            .where(
                eq(stockMovements.id, id)
            )
            .limit(1)
        
        return result[0]
    }
    
    
    async createByEvent(input: CreateStockMovement): Promise<void> {
        const result = await this.db
            .insert(stockMovements)
            .values(input)
    }
    
    
    
    
}
