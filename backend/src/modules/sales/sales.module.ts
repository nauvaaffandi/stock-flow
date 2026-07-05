import { Module } from '@nestjs/common'
import { TransactionsMainController } from './features/transactions/presentation/controllers/transactions-main.controller';

@Module({
  controllers: [TransactionsMainController]
})
export class SalesModule {}
