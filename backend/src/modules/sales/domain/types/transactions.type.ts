import type { Replace } from '../../../../types/utilities/replace'


export const TRANSACTION_TYPE = {
    SALE: 'SALE',
    RETURN: 'RETURN',
} as const

export interface Transaction {
    id: number
    type: TransactionType
    totalAmount: number
    totalItems: number
    notes?: string
    createdAt?: Date
}

export type TransactionType = (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE]

export type CreateTransaction = Pick<
    Transaction,
    | 'type'
    | 'notes'
>

export type TransactionContract = Replace<Transaction, {
    id: string
}>










