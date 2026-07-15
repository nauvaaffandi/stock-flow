import { Injectable } from '@nestjs/common'
import { transactionItems } from '../schema'
import { ConnectionService } from '../../../../../infrastructure/drizzle/connection.service'
import { ilike, eq, and, isNull, or, lt, sql, count } from 'drizzle-orm'
import { TransactionItemRepository } from '../../../domain/repositories/transaction-item.repository'
import type { TransactionItem, CreateTransactionItem } from '../../../domain/types/transaction-items.type'



export class TransactionItemRepositoryDrizzle 
    implements TransactionItemRepository
{
    private db: any
    
    constructor(
        private readonly connection: ConnectionService
    ) {
        this.db = connection.client
    }
    
    
    
    
    async create(input: CreateTransactionItem): Promise<TransactionItem> {
        const [result] = await this.db
            .insert(transactionItems)
            .values(input)
            .returning()
        
        return result
    }
}
