import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ConflictException } from '@nestjs/common'
import { CreateProductCommand } from '../commands/create-product.command'

import { ProductsRepository } from '../../../domain/repositories/products.repository'
import { CategoriesRepository } from '../../../domain/repositories/categories.repository'

import { CategoryNotFoundException } from '../../../domain/exceptions/categories/category-not-found.exception'
import { ProductAlreadyExistsException } from '../../../domain/exceptions/products/product-already-exists.exception'

import { Identifier, IdentifierPrefix } from '@core/identifier'
import type { ProductContract } from '../../../domain/types/product.type'

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand> {
	constructor(
		private readonly productsRepo: ProductsRepository,
		private readonly categoriesRepo: CategoriesRepository,
	) {}

	async execute(command: CreateProductCommand): Promise<ProductContract> {
		const { dto } = command
        
        const categoryId = Identifier.parse(dto.categoryId).id
        
		const category = await this.categoriesRepo.findById(categoryId)
        
		if (!category) {
			throw new CategoryNotFoundException(dto.categoryId)
		}
        
		const validate = await this.productsRepo.findUnique({
			name: dto.name,
			barcode: dto.barcode,
			sku: dto.sku,
		})
        
		const errorStack: {
			field: string
			message: string
		}[] = []
        
		if (validate.some((product) => product.name === dto.name)) {
			throw new ProductAlreadyExistsException(dto.name)
		}
		if (validate.some((product) => product.barcode === dto.barcode)) {
			errorStack.push({
				field: 'barcode',
				message: `Product barcode(${dto.barcode}) already exists`,
			})
		}
		if (validate.some((product) => product.sku === dto.sku)) {
			errorStack.push({
				field: 'sku',
				message: `Product sku(${dto.sku}) already exists`,
			})
		}
        
		if (Object.keys(errorStack).length != 0) {
			throw new ConflictException({
				code: 'CONFLICT_DUE_VALIDATE_CREATE_PRODUCT',
				fields: errorStack.reduce((acc, item) => {
					acc[item.field] ??= []
					acc[item.field].push(item.message)
                    
					return acc
				}, {}),
				message: errorStack.map((o) => o.message),
			})
		}
        
		const result = await this.productsRepo.create({
            ...dto,
            categoryId,
		})
        
		return {
            ...result,
            id: Identifier.create(IdentifierPrefix.PRODUCT, result.id),
            categoryId: result.categoryId == null ? null : Identifier.create(IdentifierPrefix.CATEGORY, result.categoryId),
		}
	}
}
