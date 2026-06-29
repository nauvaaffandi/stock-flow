import { Module } from '@nestjs/common'
import { OutboxService } from './outbox.service'
import { DrizzleModule } from '../infrastructure/drizzle/drizzle.module'

import { OutboxRepository } from './interface/outbox.repository'

import { DrizzleRepository } from './storage/drizzle.repository'

@Module({
	imports: [DrizzleModule],
	providers: [
		OutboxService,
		{
			provide: OutboxRepository,
			useClass: DrizzleRepository,
		},
	],
	exports: [OutboxService],
})
export class OutboxModule {}
