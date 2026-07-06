import type { Transaction, CreateTransaction } from '../types/transactions.type'




export abstract class TransactionRepository {
    abstract exists(transactionNumber: Transaction['transactionNumber']): Promise<
        | {transactionNumber: Transaction['transactionNumber']}
        | undefined
    >
    abstract create(input: CreateTransaction): Promise<Transaction>
}