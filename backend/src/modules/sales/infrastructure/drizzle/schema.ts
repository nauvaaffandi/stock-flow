import { nanoid } from 'nanoid'

import {
	pgSchema,
	pgEnum,
	text,
	numeric,
	timestamp,
	boolean,
	integer,
	index,
	uniqueIndex,
	jsonb,
	serial,
} from 'drizzle-orm/pg-core'
import { ulid } from 'ulid'
import { randomStrSortable } from '../../../../shared/libs/random'

const salesSchema = pgSchema('sales')

export const transactions = salesSchema.table(
	'transactions',
	{
		transactionNumber: text('transaction_number').primaryKey().notNull(),
		type: text('type').notNull(),
		totalAmount: integer('total_amount').notNull(),
		totalItems: integer('total_items').notNull().default(0),
		notes: text('notes'),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		uniqueIndex('transactions_number_unique').on(table.transactionNumber),
		index('transactions_type_idx').on(table.type),
		index('transactions_created_idx').on(table.createdAt),
	],
)
export const transactionItems = salesSchema.table(
	'transaction_items',
	{
		id: text().primaryKey().$defaultFn(randomStrSortable),
		transactionId: text('transaction_id')
			.notNull()
			.references(() => transactions.transactionNumber),
		productId: text('product_id').notNull(),
		unitName: text('unit_name').notNull(),
		quantity: integer('quantity').notNull(),
		unitPrice: integer('unit_price').notNull(),
		unitCost: integer('unit_cost').notNull(),
		subtotal: integer('sub_total').notNull(),
	},
	(table) => [
		index('transaction_items_transaction_idx').on(table.transactionId),
		index('transaction_items_product_idx').on(table.productId),
	],
)
export const paymentMethods = salesSchema.table(
	'payment_methods',
	{
		id: text().primaryKey().$defaultFn(randomStrSortable),
		name: text('name').notNull(),
		code: text('code').notNull(),
		isActive: boolean('is_active').notNull().default(true),
		createdAt: timestamp('created_at', {
			withTimezone: true,
		})
			.notNull()
			.defaultNow(),
	},
	(table) => [uniqueIndex('payment_methods_code_unique').on(table.code)],
)
export const transactionPayments = salesSchema.table(
	'transaction_payments',
	{
		id: text().primaryKey().$defaultFn(randomStrSortable),
		transactionId: text('transaction_id')
			.notNull()
			.references(() => transactions.transactionNumber),
		paymentMethodId: text('payment_method_id')
			.notNull()
			.references(() => paymentMethods.id),
		amount: integer('amount').notNull(),
		referenceNumber: text(),
		createdAt: timestamp('created_at', {
			withTimezone: true,
		})
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index('transaction_payments_transaction_idx').on(table.transactionId),
		index('transaction_payments_method_idx').on(table.paymentMethodId),
	],
)
