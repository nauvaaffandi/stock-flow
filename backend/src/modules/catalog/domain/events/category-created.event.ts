import { IEvent } from '@nestjs/cqrs'

import type { CategoryId, CategoryName } from '../types/category.type'

export class CategoryCreatedEvent implements IEvent {
	constructor(
		public readonly id: CategoryId,
		public readonly name: CategoryName,
	) {}
}
