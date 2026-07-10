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

const catalogSchema = pgSchema('catalog')

export const categories = catalogSchema.table(
    'categories', 
    {
    	id: bigserial('id', {
            mode: 'number',
        }).primaryKey(),
        name: text('name').notNull().unique(),
        isActive: boolean('is_active').notNull().default(true),
        createdAt: timestamp('created_at', { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true })
            .notNull()
            .defaultNow(),
    }   
)
export const products = catalogSchema.table(
	'products',
	{
		id: bigserial('id', {
            mode: 'number',
		}).primaryKey(),
		categoryId: bigint('category_id', {
            mode: 'number',
		}).references(() => categories.id, {
			onDelete: 'set null',
		}),
		name: text('name').notNull(),
		sku: text('sku').notNull(),
		barcode: text('barcode').notNull(),
		baseUnit: text('base_unit').notNull(),
		costPrice: integer('cost_price').notNull(),
		sellingPrice: integer('selling_price').notNull(),
		isActive: boolean('is_active').notNull().default(true),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		uniqueIndex('products_sku_unique').on(table.sku),
		uniqueIndex('products_barcode_idx').on(table.barcode),
		index('products_name_idx').on(table.name),
		index('products_category_idx').on(table.categoryId),
		index('products_base_unit_idx').on(table.baseUnit),
		index('products_cost_price_idx').on(table.costPrice),
		index('products_selling_price_idx').on(table.sellingPrice),
		index('products_is_active_idx').on(table.isActive),
		index('products_created_at_idx').on(table.createdAt),

		index('products_create_idx').on(table.id, table.name, table.barcode),
	],
)
export const productUnits = catalogSchema.table(
	'product_units',
	{
		id: bigserial('id', {
            mode: 'number',
		}).primaryKey(),
		productId: bigint('product_id', {
            mode: 'number',
		})
			.notNull()
			.references(() => products.id),
		name: text('name').notNull(),
		conversionFactor: integer('conversion_factor').notNull(),
		isBaseUnit: boolean('is_base_unit').notNull().default(false),
	},
	(table) => [
		index('product_units_product_idx').on(table.productId),
		index('product_units_is_base_unit_idx').on(table.isBaseUnit),
		index('product_units_name_idx').on(table.name),
		uniqueIndex('product_units_unique_product_idx').on(
			table.productId,
			table.name,
		),
	],
)
export const productUnitPrices = catalogSchema.table(
	'product_unit_prices',
	{
		id: bigserial('id', {
            mode: 'number',
		}).primaryKey(),
		productId: bigint('product_id', {
            mode: 'number',
		})
			.notNull()
			.references(() => products.id),
		unitId: bigint('unit_id', {
            mode: 'number',
		})
			.notNull()
			.references(() => productUnits.id),
		sellingPrice: integer('selling_price').notNull(),
		isActive: boolean('is_active').notNull().default(true),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		uniqueIndex('product_unit_prices_unique_idx').on(
			table.productId,
			table.unitId,
		),
		index('product_unit_prices_product_idx').on(table.productId),
		index('product_unit_prices_unit_idx').on(table.unitId),
		index('product_unit_prices_is_active_idx').on(table.isActive),
	],
)
