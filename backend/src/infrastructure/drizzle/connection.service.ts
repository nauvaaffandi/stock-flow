import { Injectable } from '@nestjs/common'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class ConnectionService {
	public readonly client

	constructor(private readonly config: ConfigService) {
		const pool = new Pool({
			connectionString: this.config.get<string>('DATABASE_URL'),
		})
		this.client = drizzle(pool)
	}
}
