



export const TRANSACTION_TYPE = {
    SALE: 'SALE',
    RETURN: 'RETURN',
} as const

export interface Transaction {
    transactionNumber: string
    type: TransactionType
    totalAmount: number
}

export type TransactionType = (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE]













