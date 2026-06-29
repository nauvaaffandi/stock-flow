import { Test } from '@nestjs/testing'
import { ConflictException } from '@nestjs/common'
import { CreateProductHandler } from '../create-product.handler'
import { CreateProductCommand } from '../../commands/create-product.command'
import { ProductsRepository } from '../../../../domain/repositories/products.repository'
import { CategoriesRepository } from '../../../../domain/repositories/categories.repository'
import { CategoryNotFoundException } from '../../../../domain/exceptions/categories/category-not-found.exception'
import { ProductAlreadyExistsException } from '../../../../domain/exceptions/products/product-already-exists.exception'

describe('CreateProductHandler', () => {
	let handler: CreateProductHandler

	// Mock Repositories
	let productsRepoMock: any
	let categoriesRepoMock: any

	beforeEach(async () => {
		// 1. Setup Mocks
		productsRepoMock = {
			findUnique: jest.fn(),
			create: jest.fn(),
		}
		categoriesRepoMock = {
			findByName: jest.fn(),
		}

		const moduleRef = await Test.createTestingModule({
			providers: [
				CreateProductHandler,
				{ provide: ProductsRepository, useValue: productsRepoMock },
				{ provide: CategoriesRepository, useValue: categoriesRepoMock },
			],
		}).compile()

		handler = moduleRef.get<CreateProductHandler>(CreateProductHandler)
	})

	it('should throw CategoryNotFoundException if category does not exist', async () => {
		// Skenario 1: Kategori gak ketemu
		categoriesRepoMock.findByName.mockResolvedValue(null)

		const command = new CreateProductCommand({
			name: 'Laptop',
			categoryName: 'Elektronik',
			barcode: '123',
			sku: 'SKU-001',
		} as any)

		await expect(handler.execute(command)).rejects.toThrow(
			CategoryNotFoundException,
		)
	})

	it('should throw ProductAlreadyExistsException if product name already exists', async () => {
		// Skenario 2: Nama duplikat
		categoriesRepoMock.findByName.mockResolvedValue({ id: 'cat-1' })
		// Simulasi return dari findUnique: array dengan object yang punya property 'name'
		productsRepoMock.findUnique.mockResolvedValue([{ name: 'Laptop' }])

		const command = new CreateProductCommand({
			name: 'Laptop',
			categoryName: 'Elektronik',
			barcode: '123',
			sku: 'SKU-001',
		} as any)

		await expect(handler.execute(command)).rejects.toThrow(
			ProductAlreadyExistsException,
		)
	})

	it('should throw ProductAlreadyExistsException if barcode already exists', async () => {
		// Skenario 3: Barcode duplikat
		categoriesRepoMock.findByName.mockResolvedValue({ id: 'cat-1' })
		productsRepoMock.findUnique.mockResolvedValue([{ barcode: '123' }])

		const command = new CreateProductCommand({
			name: 'Laptop Baru',
			categoryName: 'Elektronik',
			barcode: '123',
			sku: 'SKU-001',
		} as any)

		await expect(handler.execute(command)).rejects.toThrow(
			ConflictException,
		)
	})

	it('should successfully create a product if no conflicts', async () => {
		// Skenario 4: Sukses (findUnique return array kosong)
		categoriesRepoMock.findByName.mockResolvedValue({ id: 'cat-1' })
		productsRepoMock.findUnique.mockResolvedValue([])

		const expectedResult = { id: 'prod-999', name: 'Laptop' }
		productsRepoMock.create.mockResolvedValue(expectedResult)

		const dto = {
			name: 'Laptop',
			categoryName: 'Elektronik',
			barcode: '123',
			sku: 'SKU-001',
		}

		const command = new CreateProductCommand(dto as any)
		const result = await handler.execute(command)

		expect(result).toEqual(expectedResult)
		expect(productsRepoMock.create).toHaveBeenCalledWith(dto)
	})
})
