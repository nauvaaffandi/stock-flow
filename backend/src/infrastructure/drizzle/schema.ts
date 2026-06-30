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
import { randomStrSortable } from '../../shared/libs/random'

const outboxSchema = pgSchema('outbox')

export const messages = outboxSchema.table(
	'outbox',
	{
		id: serial('id').primaryKey(),
		identifier: text('identifier').notNull(),
		payload: jsonb('payload').notNull(),
		status: text('status').default('PENDING'),
		retryCount: integer('retry_count').default(0),
		createdAt: timestamp('created_at', {
			withTimezone: true,
		})
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', {
			withTimezone: true,
		})
			.notNull()
			.defaultNow(),
		sentAt: timestamp('sent_at', { withTimezone: true }),
	},
	(table) => [
		index('outbox_id_idx').on(table.id),
		index('outbox_status_idx').on(table.status),
	],
)
