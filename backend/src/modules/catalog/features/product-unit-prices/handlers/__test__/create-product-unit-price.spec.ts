import { Test } from '@nestjs/testing'
import { CreateProductUnitPriceHandler } from '../create-product-unit-price.handler'
import { CreateProductUnitPriceCommand } from '../../commands/create-product-unit-price.command'
import { ProductsRepository } from '../../../../domain/repositories/products.repository'
import { ProductUnitsRepository } from '../../../../domain/repositories/product-units.repository'
import { ProductUnitPricesRepository } from '../../../../domain/repositories/product-unit-prices.repository'
import { ProductNotFoundException } from '../../../../domain/exceptions/products/product-not-found.exception'
import { ProductUnitNotFoundException } from '../../../../domain/exceptions/product-units/product-unit-not-found.exception'
import { ProductUnitPriceAlreadyExistsException } from '../../../../domain/exceptions/product-unit-prices/product-unit-price-already-exists.exception'

describe('CreateProductUnitPriceHandler', () => {
	let handler: CreateProductUnitPriceHandler

	let productsRepoMock: any
	let productUnitsRepoMock: any
	let productUnitPricesRepoMock: any

	beforeEach(async () => {
		productsRepoMock = { existsById: jest.fn() }
		productUnitsRepoMock = { existsById: jest.fn() }
		productUnitPricesRepoMock = {
			existsByProductIdAndUnitId: jest.fn(),
			create: jest.fn(),
		}

		const moduleRef = await Test.createTestingModule({
			providers: [
				CreateProductUnitPriceHandler,
				{ provide: ProductsRepository, useValue: productsRepoMock },
				{
					provide: ProductUnitsRepository,
					useValue: productUnitsRepoMock,
				},
				{
					provide: ProductUnitPricesRepository,
					useValue: productUnitPricesRepoMock,
				},
			],
		}).compile()

		handler = moduleRef.get<CreateProductUnitPriceHandler>(
			CreateProductUnitPriceHandler,
		)
	})

	it('should throw ProductNotFoundException if product does not exist', async () => {
		productsRepoMock.existsById.mockResolvedValue(null)

		const command = new CreateProductUnitPriceCommand(
			'prod-123',
			'unit-456',
			{ price: 10000 } as any,
		)

		await expect(handler.execute(command)).rejects.toThrow(
			ProductNotFoundException,
		)
		expect(productsRepoMock.existsById).toHaveBeenCalledWith('prod-123')
	})

	it('should throw ProductUnitNotFoundException if unit does not exist', async () => {
		productsRepoMock.existsById.mockResolvedValue({ id: 'prod-123' })
		productUnitsRepoMock.existsById.mockResolvedValue(null)

		const command = new CreateProductUnitPriceCommand(
			'prod-123',
			'unit-456',
			{} as any,
		)

		await expect(handler.execute(command)).rejects.toThrow(
			ProductUnitNotFoundException,
		)
		expect(productUnitsRepoMock.existsById).toHaveBeenCalledWith('unit-456')
	})

	it('should throw ProductUnitPriceAlreadyExistsException if price already exists', async () => {
		productsRepoMock.existsById.mockResolvedValue({ id: 'prod-123' })
		productUnitsRepoMock.existsById.mockResolvedValue({
			id: 'unit-456',
			name: 'Kg',
		})
		productUnitPricesRepoMock.existsByProductIdAndUnitId.mockResolvedValue(
			true,
		)

		const command = new CreateProductUnitPriceCommand(
			'prod-123',
			'unit-456',
			{} as any,
		)

		await expect(handler.execute(command)).rejects.toThrow(
			ProductUnitPriceAlreadyExistsException,
		)
	})

	it('should successfully create a product unit price', async () => {
		productsRepoMock.existsById.mockResolvedValue({ id: 'prod-123' })
		productUnitsRepoMock.existsById.mockResolvedValue({
			id: 'unit-456',
			name: 'Kg',
		})
		productUnitPricesRepoMock.existsByProductIdAndUnitId.mockResolvedValue(
			false,
		)

		const expectedResult = {
			id: 'price-789',
			productId: 'prod-123',
			unitId: 'unit-456',
			price: 10000,
		}
		productUnitPricesRepoMock.create.mockResolvedValue(expectedResult)

		const command = new CreateProductUnitPriceCommand(
			'prod-123',
			'unit-456',
			{ price: 10000 } as any,
		)

		const result = await handler.execute(command)

		expect(result).toEqual(expectedResult)
		expect(productUnitPricesRepoMock.create).toHaveBeenCalledWith({
			price: 10000,
			productId: 'prod-123',
			unitId: 'unit-456',
		})
	})
})
