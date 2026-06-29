import { IEvent } from '@nestjs/cqrs'

import type { Product } from '../types/product.type'

export class ProductCreatedEvent implements IEvent {
	constructor(public readonly product: Product) {}
}
