import { IEvent } from '@nestjs/cqrs'

import type { CategoryContract } from '../types/category.type'

export class CategoryCreatedEvent implements IEvent {
	constructor(
		public readonly id: CategoryContract['id'],
		public readonly name: CategoryContract['name'],
	) {}
}
