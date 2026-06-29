import { Injectable } from '@nestjs/common'
import { OutboxRepository } from './interface/outbox.repository'

@Injectable()
export class OutboxService {
	constructor(private readonly repo: OutboxRepository) {}

	async emit(identifier: string, payload: any) {
		try {
			await this.repo.save({
				identifier,
				payload,
			})
		} catch (e) {
			console.log(e)
		}
	}
}
