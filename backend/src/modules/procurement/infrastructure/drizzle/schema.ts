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

const procurementSchema = pgSchema('procurement')

export const purchaseStatusEnum = procurementSchema.enum('purchase_status', [
	'DRAFT',
	'CONFIRMED',
	'RECEIVED',
	'CANCELLED',
])

export const suppliers = procurementSchema.table(
	'suppliers',
	{
		id: text('id').primaryKey().$defaultFn(randomStrSortable),
		name: text('name').notNull(),
		code: text('code').notNull().unique(),
		phone: text('phone'),
		address: text('address'),
		isActive: boolean('is_active').notNull().default(true),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index('suppliers_name_idx').on(table.name),
		index('suppliers_is_active_idx').on(table.isActive),
	],
)
export const purchases = procurementSchema.table(
	'purchases',
	{
		id: text('id').primaryKey().$defaultFn(randomStrSortable),
		supplierCode: text('supplier_code')
			.notNull()
			.references(() => suppliers.code),
		referenceNumber: text('reference_number').notNull(), // nomor PO / faktur supplier
		status: purchaseStatusEnum('status').notNull().default('DRAFT'),
		totalCost: integer('total_cost').notNull().default(0),
		notes: text('notes'),
		receivedAt: timestamp('received_at', { withTimezone: true }), // diisi saat status → RECEIVED
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		uniqueIndex('purchases_reference_unique').on(table.referenceNumber),
		index('purchases_supplier_idx').on(table.supplierCode),
		index('purchases_status_idx').on(table.status),
		index('purchases_created_idx').on(table.createdAt),
	],
)
export const purchaseItems = procurementSchema.table(
	'purchase_items',
	{
		id: text('id').primaryKey().$defaultFn(randomStrSortable),
		purchaseId: text('purchase_id')
			.notNull()
			.references(() => purchases.id),
		productId: text('product_id').notNull(),
		unitName: text('unit_name').notNull(), // snapshot nama satuan
		conversionFactor: integer('conversion_factor').notNull(), // ke base unit
		quantity: integer('quantity').notNull(), // dalam unitName
		quantityInBase: integer('quantity_in_base').notNull(), // quantity × conversionFactor
		unitCost: integer('unit_cost').notNull(), // harga beli per unitName
		subtotal: integer('subtotal').notNull(), // quantity × unitCost
	},
	(table) => [
		index('purchase_items_purchase_idx').on(table.purchaseId),
		index('purchase_items_product_idx').on(table.productId),
	],
)
