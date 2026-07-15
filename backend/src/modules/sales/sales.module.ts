import { Module } from '@nestjs/common'
import { DrizzleModule } from '../../infrastructure/drizzle/drizzle.module'
import { CatalogModule } from '@modules/catalog/catalog.module'

import { TransactionRepository } from './domain/repositories/transaction.repository'
import { TransactionRepositoryDrizzle } from './infrastructure/drizzle/repositories/transaction-repository.drizzle'

import { CreateTransactionHandler } from './features/transactions/handlers/create-transaction.handler'
import { CreateTransactionItemHandler } from './features/transaction-items/handlers/create-transaction-item.handler'

import { TransactionsMainController } from './features/transactions/presentation/controllers/transactions-main.controller';
import { TransactionItemsMainController } from './features/transaction-items/presentation/controllers/transaction-items-main.controller';

@Module({
    imports: [DrizzleModule, CatalogModule],
    providers: [
        {
            provide: TransactionRepository,
            useClass: TransactionRepositoryDrizzle,
        },
        
        CreateTransactionHandler,
        CreateTransactionItemHandler
    ],
    controllers: [
        TransactionsMainController,
        TransactionItemsMainController
    ],
})
export class SalesModule {}
