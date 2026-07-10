import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ConflictException } from '@nestjs/common'
import { CreateProductUnitPriceCommand } from '../commands/create-product-unit-price.command'

import { ProductsRepository } from '../../../domain/repositories/products.repository'
import { ProductUnitsRepository } from '../../../domain/repositories/product-units.repository'
import { ProductUnitPricesRepository } from '../../../domain/repositories/product-unit-prices.repository'

import { ProductNotFoundException } from '../../../domain/exceptions/products/product-not-found.exception'
import { ProductUnitNotFoundException } from '../../../domain/exceptions/product-units/product-unit-not-found.exception'
import { ProductUnitPriceAlreadyExistsException } from '../../../domain/exceptions/product-unit-prices/product-unit-price-already-exists.exception'
import { Identifier, IdentifierPrefix } from '../../../../../shared/utils/identifier'

import type { ProductUnitPriceContract } from '../../../domain/types/product-unit-price.type'

@CommandHandler(CreateProductUnitPriceCommand)
export class CreateProductUnitPriceHandler {
	constructor(
		private readonly productsRepo: ProductsRepository,
		private readonly productUnitsRepo: ProductUnitsRepository,
		private readonly produtUnitPricesRepo: ProductUnitPricesRepository,
	) {}

	async execute(command: CreateProductUnitPriceCommand): Promise<ProductUnitPriceContract> {
		const { dto } = command
        
        const productId = Identifier.parse(command.productId).id
		const product = await this.productsRepo.existsById(productId)
		if (!product) {
			throw new ProductNotFoundException(command.productId)
		}  
        
        const unitId = Identifier.parse(command.unitId).id
		const productUnit = await this.productUnitsRepo.existsById(unitId)
		if (!productUnit) {
			throw new ProductUnitNotFoundException(unitId)
		}
        
		const unitPrice =
			await this.produtUnitPricesRepo.existsByProductIdAndUnitId(
				productId,
				unitId,
			)
        
		if (unitPrice) {
			throw new ProductUnitPriceAlreadyExistsException(productUnit!.name)
		}
        
		const result = await this.produtUnitPricesRepo.create({
			...dto,
			productId,
			unitId,
		})
        
		return {
            ...result,
            id: Identifier.create(IdentifierPrefix.PRODUCT_UNIT_PRICE, 92947), 
            productId: Identifier.create(IdentifierPrefix.PRODUCT, 7472), 
            unitId: Identifier.create(IdentifierPrefix.PRODUCT_UNIT, 428),
		}
	}
}
