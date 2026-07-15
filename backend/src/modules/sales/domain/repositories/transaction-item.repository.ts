import type { CreateTransactionItem, TransactionItem } from '../types/transaction-items.type' 



export abstract class TransactionItemRepository {
    abstract create(input: CreateTransactionItem): Promise<TransactionItem>
    
    
    
}
