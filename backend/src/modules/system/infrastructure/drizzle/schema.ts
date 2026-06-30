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

const systemSchema = pgSchema('system')

export const auditLogs = systemSchema.table(
	'audit_logs',
	{
		id: text().primaryKey().$defaultFn(randomStrSortable),
		action: text('action').notNull(),
		entity: text('entity').notNull(),
		entityId: text('entity_id').notNull(),
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
