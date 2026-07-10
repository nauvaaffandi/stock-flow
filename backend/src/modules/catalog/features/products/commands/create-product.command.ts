import { CreateProductDto } from '../presentation/dto/create-product.dto'
import { Command } from '@nestjs/cqrs'
import type { ProductContract } from '../../../domain/types/product.type'

export class CreateProductCommand extends Command<ProductContract> {
	constructor(public readonly dto: CreateProductDto) {
	    super()
	}
}
