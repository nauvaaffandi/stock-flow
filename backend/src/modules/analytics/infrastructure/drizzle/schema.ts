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

const analyticsSchema = pgSchema('analytics')

export const salesDailySummary = analyticsSchema.table(
	'sales_daily_summary',
	{
		productId: text('product_id').notNull(),
		totalQtySold: integer('total_quantity_sold').notNull(),
		totalRevenue: integer('total_revenue').notNull(),
		totalCost: integer('total_cost').notNull(),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	(table) => [
		index('analytics_total_revenue_idx').on(table.totalRevenue),
		index('analytics_total_qty_sold_idx').on(table.totalQtySold),
		index('analytics_date_idx').on(table.createdAt),
		index('analytics_total_revenue_date_idx').on(
			table.totalRevenue,
			table.createdAt,
		),
		index('analytics_total_qty_sold_date_idx').on(
			table.totalQtySold,
			table.createdAt,
		),
	],
)
