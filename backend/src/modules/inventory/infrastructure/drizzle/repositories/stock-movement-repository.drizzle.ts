import { StockMovementRepository } from '../../../domain/repositories/stock-movement.repository'
import { Injectable } from '@nestjs/common'
import { stockMovements } from '../schema'
import { ConnectionService } from '../../../../../infrastructure/drizzle'
import { ilike, inArray, eq, and, isNull, or, lt, asc, desc, sql, count } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import type { Database } from '../../../../../infrastructure/drizzle'


@Injectable()
export class StockMovementRepositoryDrizzle
    implements StockMovementRepository
{
    private db: Database
    
    constructor(private readonly connection: ConnectionService) {
        this.db = connection.client
    }
    
    
    async existsById() {
        
    }
    
    
}
