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
	bigserial,
	bigint,
} from 'drizzle-orm/pg-core'

const systemSchema = pgSchema('system')

export const auditLogs = systemSchema.table(
	'audit_logs',
	{
		id: bigserial('id', {
            mode: 'number',
		}).primaryKey(),
		action: text('action').notNull(),
		entity: text('entity').notNull(),
		entityId: bigint('entity_id', {
            mode: 'number',
		}).notNull(),
		oldValue: jsonb('old_value'),
		newValue: jsonb('new_value'),
		createdAt: timestamp('created_at', {
			withTimezone: true,
		})
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index('audit_logs_entity_idx').on(table.entity),
		index('audit_logs_entity_id_idx').on(table.entityId),
		index('audit_logs_created_idx').on(table.createdAt),
	],
)
