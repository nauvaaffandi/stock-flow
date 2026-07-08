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
	bigint,
	bigserial,
} from 'drizzle-orm/pg-core'

const salesSchema = pgSchema('sales')

export const transactionsTypeEnum = salesSchema.enum(
    'transactions_type',
    ['SALE', 'RETURN']
)

export const transactions = salesSchema.table(
	'transactions',
	{
		id: bigserial('id', {
            mode: 'number',
		}).primaryKey(),
		type: transactionsTypeEnum('type').notNull(),
		totalAmount: integer('total_amount').notNull().default(0),
		totalItems: integer('total_items').notNull().default(0),
		notes: text('notes'),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index('transactions_type_idx').on(table.type),
		index('transactions_created_idx').on(table.createdAt),
	],
)

export const transactionItems = salesSchema.table(
	'transaction_items',
	{
		id: bigserial('id', {
            mode: 'number',
		}).primaryKey(),
		transactionId: bigint('transaction_id', {
            mode: 'number',
		})
			.notNull()
			.references(() => transactions.id),
		productId: bigint('product_id', {
            mode: 'number',
		}).notNull(),
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
        id: bigserial('id', {
            mode: 'number',
		}).primaryKey(),
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
        id: bigserial('id', {
            mode: 'number'
        }).primaryKey(),
		transactionId: bigint('transaction_id', {
            mode: 'number',
		})
			.notNull()
			.references(() => transactions.id),
		paymentMethodId: bigint('payment_method_id', {
            mode: 'number',
		})
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
