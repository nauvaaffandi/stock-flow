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
		id: bigserial('id', {
            mode: 'number'
		}).primaryKey(),
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
		id: bigserial('id', {
            mode: 'number',
		}).primaryKey(),
		supplierId: bigint('supplier_id', {
            mode: 'number',
		})
			.notNull()
			.references(() => suppliers.id),
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
		index('purchases_supplier_idx').on(table.supplierId),
		index('purchases_status_idx').on(table.status),
		index('purchases_created_idx').on(table.createdAt),
	],
)
export const purchaseItems = procurementSchema.table(
	'purchase_items',
	{
		id: bigserial('id', {
            mode: 'number',
		}).primaryKey(),
		purchaseId: bigint('purchase_id', {
            mode: 'number',
		})
			.notNull()
			.references(() => purchases.id),
		productId: bigint('product_id', {
            mode: 'number',
		}).notNull(),
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
