import { IEvent } from '@nestjs/cqrs'

import type { ProductContract } from '../types/product.type'

export class ProductCreatedEvent implements IEvent {
	constructor(public readonly product: ProductContract) {}
}
