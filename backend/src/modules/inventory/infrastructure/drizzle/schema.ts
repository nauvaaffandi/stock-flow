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
	bigserial,
	bigint,
} from 'drizzle-orm/pg-core'


const inventorySchema = pgSchema('inventory')

export const stockMovementTypeEnum = inventorySchema.enum(
	'stock_movement_type',
	[
		'PURCHASE',
		'SALE',
		'ADJUSTMENT_IN',
		'ADJUSTMENT_OUT',
		'RETURN_SUPPLIER',
		'RETURN_CUSTOMER',
		'OPENING_BALANCE',
	],
)
export const stockMovementReferenceTypeEnum = inventorySchema.enum(
	'stock_movement_reference_type',
	['PURCHASE', 'TRANSACTION', 'ADJUSTMENT', 'OPENING_BALANCE'],
)
export const stockAdjustmentStatusEnum = inventorySchema.enum(
	'stock_adjustment_status',
	['DRAFT', 'CONFIRMED', 'CANCELLED'],
)
export const stockAdjustmentReasonEnum = inventorySchema.enum(
	'stock_adjustment_reason',
	['OPNAME', 'DAMAGED', 'EXPIRED', 'LOST', 'OTHER'],
)

export const stockMovements = inventorySchema.table(
	'stock_movements',
	{
		id: bigserial('id', {
            mode: 'number',
		}).primaryKey(),
		productId: bigint('product_id', {
            mode: 'number'
		}).notNull(),
		transactionId: bigint('transaction_id', {
            mode: 'number',
		}),
		type: stockMovementTypeEnum('type').notNull(),
		quantity: integer('quantity').notNull(),
		referenceId: text('reference_id'),
		referenceType: stockMovementReferenceTypeEnum('reference_type'),
		notes: text('notes'),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index('stock_movements_product_idx').on(table.productId),
		index('stock_movements_type_idx').on(table.type),
		index('stock_movements_created_idx').on(table.createdAt),
		index('stock_movements_reference_idx').on(
			table.referenceType,
			table.referenceId,
		),
		index('stock_movements_product_created_idx').on(
            table.productId,
            table.createdAt,
        )
	],
)
export const stockSnapshots = inventorySchema.table(
	'stock_snapshots',
	{
		id: bigserial('id', {
            mode: 'number',
		}).primaryKey(),
		productId: bigint('product_id', {
            mode: 'number',
		}).notNull(),
		quantity: integer('quantity').notNull(),
		calculatedAt: timestamp('calculated_at', {
			withTimezone: true,
		})
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index('stock_snapshots_product_idx').on(table.productId),
		index('stock_snapshots_calculated_idx').on(table.calculatedAt),
		index('stock_snapshots_product_calculated_idx').on(
            table.productId,
            table.calculatedAt,
        ),
	],
)
export const stockAdjustments = inventorySchema.table(
	'stock_adjustments',
	{
		id: bigserial('id', {
            mode: 'number',
		}).primaryKey(),
		referenceNumber: text('reference_number').notNull(), // nomor dokumen opname
		reason: stockAdjustmentReasonEnum('reason').notNull(),
		status: stockAdjustmentStatusEnum('status').notNull().default('DRAFT'),
		notes: text('notes'),
		confirmedAt: timestamp('confirmed_at', { withTimezone: true }), // diisi saat status → CONFIRMED
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		uniqueIndex('stock_adjustments_reference_unique').on(
			table.referenceNumber,
		),
		index('stock_adjustments_status_idx').on(table.status),
		index('stock_adjustments_reason_idx').on(table.reason),
		index('stock_adjustments_created_idx').on(table.createdAt),
	],
)
export const stockAdjustmentItems = inventorySchema.table(
	'stock_adjustment_items',
	{
		id: bigserial('id', {
            mode: 'number',
		}).primaryKey(),
		adjustmentId: bigint('adjustment_id', {
            mode: 'number',
		})
			.notNull()
			.references(() => stockAdjustments.id),
		productId: bigint('product_id', {
            mode: 'number',
		}).notNull(),
		systemQuantity: integer('system_quantity').notNull(),
		physicalQuantity: integer('physical_quantity').notNull(),
		difference: integer('difference').notNull(),
		notes: text('notes'),
	},
	(table) => [
		index('stock_adjustment_items_adjustment_idx').on(table.adjustmentId),
		index('stock_adjustment_items_product_idx').on(table.productId),
	],
)
