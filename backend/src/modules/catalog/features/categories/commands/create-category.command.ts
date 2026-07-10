import { CreateCategoryDto } from '../presentation/dto/create-category.dto'
import type { CategoryContract } from '../../../domain/types/category.type'
import { Command } from '@nestjs/cqrs'

export class CreateCategoryCommand extends Command<CategoryContract> {
	constructor(public readonly dto: CreateCategoryDto) {
        super()
	}
}
