import { Module } from '@nestjs/common'
import { DrizzleModule } from '../../infrastructure/drizzle/drizzle.module'

import { TransactionRepository } from './domain/repositories/transaction.repository'
import { TransactionRepositoryDrizzle } from './infrastructure/drizzle/repositories/transaction-repository.drizzle'

import { CreateTransactionHandler } from './features/transactions/handlers/create-transaction.handler'

import { TransactionsMainController } from './features/transactions/presentation/controllers/transactions-main.controller';

@Module({
    imports: [DrizzleModule],
    providers: [
        {
            provide: TransactionRepository,
            useClass: TransactionRepositoryDrizzle,
        },
        
        CreateTransactionHandler,
    ],
    controllers: [
        TransactionsMainController
    ],
})
export class SalesModule {}
