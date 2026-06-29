import { Test } from '@nestjs/testing'
import { CreateCategoryHandler } from '../create-category.handler'
import { CreateCategoryCommand } from '../../commands/create-category.command'
import { CategoriesRepository } from '../../../../domain/repositories/categories.repository'
import { CategoryAlreadyExistsException } from '../../../../domain/exceptions/categories/category-already-exists.exception'

describe('CreateCategoryHandler', () => {
	let handler: CreateCategoryHandler
	let categoriesRepoMock: any

	beforeEach(async () => {
		categoriesRepoMock = {
			create: jest.fn(),
		}

		const moduleRef = await Test.createTestingModule({
			providers: [
				CreateCategoryHandler,
				{ provide: CategoriesRepository, useValue: categoriesRepoMock },
			],
		}).compile()

		handler = moduleRef.get<CreateCategoryHandler>(CreateCategoryHandler)
	})

	it('should throw CategoryAlreadyExistsException if category already exists', async () => {
		categoriesRepoMock.create.mockResolvedValue([])
		const command = new CreateCategoryCommand({ name: 'Elektronik' } as any)

		await expect(handler.execute(command)).rejects.toThrow(
			CategoryAlreadyExistsException,
		)

		expect(categoriesRepoMock.create).toHaveBeenCalledWith('Elektronik')
	})

	it('should successfully create a category', async () => {
		const expectedResult = [{ id: 'cat-1', name: 'Elektronik' }]
		categoriesRepoMock.create.mockResolvedValue(expectedResult)

		const command = new CreateCategoryCommand({ name: 'Elektronik' } as any)
		const result = await handler.execute(command)

		expect(result).toEqual(expectedResult)
		expect(categoriesRepoMock.create).toHaveBeenCalledWith('Elektronik')
	})
})
