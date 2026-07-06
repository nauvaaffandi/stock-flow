import { Injectable } from '@nestjs/common'
import { transactions } from '../schema'
import { ConnectionService } from '../../../../../infrastructure/drizzle/connection.service'
import { ilike, eq, and, isNull, or, lt, sql, count } from 'drizzle-orm'
import { TransactionRepository } from '../../../domain/repositories/transaction.repository'
import type { Transaction, CreateTransaction } from '../../../domain/types/transactions.type'


@Injectable()
export class TransactionRepositoryDrizzle 
    implements TransactionRepository
{
    private db: any
    
    constructor(private readonly connection: ConnectionService) {
        this.db = connection.client
    }
    
    async exists(transactionNumber: Transaction['transactionNumber']): Promise<
    | {transactionNumber: Transaction['transactionNumber']}
    | undefined
    > {
        const result = await this.db
            .select({
                transactionNumber: transactions.transactionNumber
            })
            .from(transactions)
            .where(
                eq(transactions.transactionNumber, transactionNumber)
            )
            .limit(1)
        
        return result[0]
    }
    
    async create(input: CreateTransaction): Promise<Transaction> {
        const [result] = await this.db
            .insert(transactions)
            .values(input)
            .returning()
        
        return result
    }
    
}
