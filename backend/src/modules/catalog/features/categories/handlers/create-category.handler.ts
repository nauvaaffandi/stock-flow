import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ConflictException } from '@nestjs/common'
import { CreateCategoryCommand } from '../commands/create-category.command'
import { CategoriesRepository } from '../../../domain/repositories/categories.repository'
import { CategoryAlreadyExistsException } from '../../../domain/exceptions/categories/category-already-exists.exception'
import { Identifier, IdentifierPrefix } from '../../../../../shared/utils/identifier'
import type { CategoryContract } from '../../../domain/types/category.type'

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler 
    implements ICommandHandler<CreateCategoryCommand> 
{
	constructor(private readonly categoriesRepo: CategoriesRepository) {}

	async execute(command: CreateCategoryCommand): Promise<CategoryContract> {
		const { dto } = command
		const category = await this.categoriesRepo.create(dto.name)
        
		if (category.length == 0) {
			throw new CategoryAlreadyExistsException(dto.name)
		}
        
		const result = category[0]
        
		return {
            ...result,
            id: Identifier.create(IdentifierPrefix.CATEGORY, result.id)
		}
	}
}
