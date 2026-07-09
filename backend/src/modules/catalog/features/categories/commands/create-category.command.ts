import { CreateCategoryDto } from '../presentation/dto/create-category.dto'
import type { CategoryResponse } from '../../../domain/types/category.type'
import { Command } from '@nestjs/cqrs'

export class CreateCategoryCommand extends Command<CategoryResponse> {
	constructor(public readonly dto: CreateCategoryDto) {
        super()
	}
}
