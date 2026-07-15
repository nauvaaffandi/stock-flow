import type { Replace } from '../../../../types/utilities/replace'
import type { Transaction, TransactionContract } from './transactions.type'
import type { Product, ProductUnit, ProductContract, ProductUnitContract } from '@modules/catalog'

export interface TransactionItem {
    id: number
    transactionId: Transaction['id']
    productId: Product['id']
    unitId: ProductUnit['id']
    quantity: number
    unitPrice: number
    unitCost: number
    subtotal: number
}

export type CreateTransactionItem = Pick<
    TransactionItem,
    | 'transactionId'
    | 'productId'
    | 'unitId'
    | 'quantity'
    | 'unitPrice'
    | 'unitCost'
    | 'subtotal'
>

export type TransactionItemContract = Replace<TransactionItem, {
    id: string
    transactionId: TransactionContract['id']
    productId: ProductContract['id']
    unitId: ProductUnitContract['id']
}>













