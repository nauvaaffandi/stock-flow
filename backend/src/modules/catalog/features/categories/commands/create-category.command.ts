import { CreateCategoryDto } from '../presentation/dto/create-category.dto'

export class CreateCategoryCommand {
	constructor(public readonly dto: CreateCategoryDto) {}
}
