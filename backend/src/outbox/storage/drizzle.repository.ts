import { OutboxRepository } from '../interface/outbox.repository'
import { ConnectionService } from '../../infrastructure/drizzle/connection.service'

import { messages } from '../../infrastructure/drizzle'

export class DrizzleRepository implements OutboxRepository {
	private readonly db: any

	constructor(private readonly connection: ConnectionService) {
		this.db = connection.client
	}

	async save(input) {
		const result = await this.db.insert(messages).values({
			...input,
		})
	}
}
