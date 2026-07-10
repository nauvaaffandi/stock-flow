import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ConflictException } from '@nestjs/common'
import { CreateProductUnitCommand } from '../commands/create-product-unit.command'

import { ProductsRepository } from '../../../domain/repositories/products.repository'
import { ProductUnitsRepository } from '../../../domain/repositories/product-units.repository'

import { ProductNotFoundException } from '../../../domain/exceptions/products/product-not-found.exception'

import { Identifier, IdentifierPrefix } from '../../../../../shared/utils/identifier'

import type { ProductUnitContract } from '../../../domain/types/product-unit.type'

@CommandHandler(CreateProductUnitCommand)
export class CreateProductUnitHandler {
	constructor(
		private readonly productsRepo: ProductsRepository,
		private readonly productUnitsRepo: ProductUnitsRepository,
	) {}

	async execute(command: CreateProductUnitCommand): Promise<ProductUnitContract> {
		const { dto } = command
        
        const productId = Identifier.parse(command.productId).id
		const product = await this.productsRepo.existsById(productId)
		if (!product) {
			throw new ProductNotFoundException(command.productId)
		}
        
		const units = await this.productUnitsRepo.findUnits(productId)
		const errorStack: {
			field: string
			message: string
		}[] = []
        
		if (
			dto.isBaseUnit &&
			units.some((productUnit) => productUnit.isBaseUnit)
		) {
			errorStack.push({
				field: 'isBaseUnit',
				message: `Product unit baseUnit already exists in "${units.find((productUnit) => productUnit.isBaseUnit == dto.isBaseUnit)!.name}"`,
			})
		}
        
		if (units.some((productUnit) => productUnit.name == dto.name)) {
			errorStack.push({
				field: 'name',
				message: `Product unit name(${dto.name}) already exists`,
			})
		}
        
		if (errorStack.length != 0) {
			throw new ConflictException({
				code: 'CONFLICT_DUE_VALIDATE_CREATE_PRODUCT_UNIT',
				fields: errorStack.reduce((acc, item) => {
					acc[item.field] ??= []
					acc[item.field].push(item.message)
                    
					return acc
				}, {}),
				message: errorStack.map((obj) => obj.message),
			})
		}
        
		const result = await this.productUnitsRepo.create({
			...dto,
			productId,
		})
        
		return {
            ...result,
            id: Identifier.create(IdentifierPrefix.PRODUCT_UNIT, result.id),
            productId: Identifier.create(IdentifierPrefix.PRODUCT, result.productId)
		}
	}
}
