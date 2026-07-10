import type { Transaction, CreateTransaction } from '../types/transactions.type'




export abstract class TransactionRepository {
    abstract exists(id: Transaction['id']): Promise<
        | {id: Transaction['id']}
        | undefined
    >
    abstract create(input: CreateTransaction): Promise<Transaction>
}