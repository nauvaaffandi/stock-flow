import { ProductService } from '../../domain/interfaces/product-service.abstract'
import type {
	ProductId,
	Product,
} from '../../domain/types/product.type'
import { Injectable } from '@nestjs/common'
import { ProductsRepository } from '../../domain/repositories/products.repository'

@Injectable()
export class ProductServiceImpl implements ProductService {
	constructor(private readonly repo: ProductsRepository) {}

	async getProductById(id: ProductId): Promise<{
		found: boolean
		data?: Product
	}> {
		const result = await this.repo.findById(id)

		if (result)
			return {
				found: true,
				data: result,
			}

		return { found: false }
	}
}
