import { Test } from '@nestjs/testing'
import { ConflictException } from '@nestjs/common'
import { CreateProductUnitHandler } from '../create-product-unit.handler'
import { CreateProductUnitCommand } from '../../commands/create-product-unit.command'
import { ProductsRepository } from '../../../../domain/repositories/products.repository'
import { ProductUnitsRepository } from '../../../../domain/repositories/product-units.repository'
import { ProductNotFoundException } from '../../../../domain/exceptions/products/product-not-found.exception'

describe('CreateProductUnitHandler', () => {
	let handler: CreateProductUnitHandler

	// Mock Repositories
	let productsRepoMock: any
	let productUnitsRepoMock: any

	beforeEach(async () => {
		// 1. Setup Mocks
		productsRepoMock = { existsById: jest.fn() }
		productUnitsRepoMock = {
			findUnits: jest.fn(),
			create: jest.fn(),
		}

		const moduleRef = await Test.createTestingModule({
			providers: [
				CreateProductUnitHandler,
				{ provide: ProductsRepository, useValue: productsRepoMock },
				{
					provide: ProductUnitsRepository,
					useValue: productUnitsRepoMock,
				},
			],
		}).compile()

		handler = moduleRef.get<CreateProductUnitHandler>(
			CreateProductUnitHandler,
		)
	})

	it('should throw ProductNotFoundException if product does not exist', async () => {
		// Skenario 1: Produk gak ketemu
		productsRepoMock.existsById.mockResolvedValue(null)

		const command = new CreateProductUnitCommand('prod-123', {
			name: 'Kg',
			isBaseUnit: true,
		} as any)

		await expect(handler.execute(command)).rejects.toThrow(
			ProductNotFoundException,
		)
	})

	it('should throw ConflictException if base unit already exists', async () => {
		// Skenario 2: Produk ada, tapi Base Unit udah ada
		productsRepoMock.existsById.mockResolvedValue({ id: 'prod-123' })

		// Simulasi: Di DB udah ada unit "Gram" yang jadi base unit
		productUnitsRepoMock.findUnits.mockResolvedValue([
			{ id: 'u-1', name: 'Gram', isBaseUnit: true },
		])

		const command = new CreateProductUnitCommand(
			'prod-123',
			{ name: 'Kg', isBaseUnit: true } as any, // Mau bikin base unit lagi
		)

		await expect(handler.execute(command)).rejects.toThrow(
			ConflictException,
		)
	})

	it('should throw ConflictException if unit name already exists', async () => {
		// Skenario 3: Produk ada, nama unit udah ada
		productsRepoMock.existsById.mockResolvedValue({ id: 'prod-123' })

		// Simulasi: Di DB udah ada unit "Kg"
		productUnitsRepoMock.findUnits.mockResolvedValue([
			{ id: 'u-1', name: 'Kg', isBaseUnit: false },
		])

		const command = new CreateProductUnitCommand(
			'prod-123',
			{ name: 'Kg', isBaseUnit: false } as any, // Mau bikin nama yang sama
		)

		await expect(handler.execute(command)).rejects.toThrow(
			ConflictException,
		)
	})

	it('should successfully create a product unit', async () => {
		// Skenario 4: Sukses (tidak ada duplikat)
		productsRepoMock.existsById.mockResolvedValue({ id: 'prod-123' })
		productUnitsRepoMock.findUnits.mockResolvedValue([]) // Belum ada unit sama sekali

		const expectedResult = {
			id: 'unit-999',
			name: 'Kg',
			productId: 'prod-123',
		}
		productUnitsRepoMock.create.mockResolvedValue(expectedResult)

		const dto = { name: 'Kg', isBaseUnit: true }
		const command = new CreateProductUnitCommand('prod-123', dto as any)

		const result = await handler.execute(command)

		expect(result).toEqual(expectedResult)
		expect(productUnitsRepoMock.create).toHaveBeenCalledWith({
			...dto,
			productId: 'prod-123',
		})
	})
})
