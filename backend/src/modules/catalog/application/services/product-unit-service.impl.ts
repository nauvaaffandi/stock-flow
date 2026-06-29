import { ProductUnitService } from '../../domain/interfaces/product-unit-service.abstract'
import { Injectable } from '@nestjs/common'
import { ProductUnitsRepository } from '../../domain/repositories/product-units.repository'

import type {
	ProductUnitId,
	ProductUnitName,
	ProductUnit,
} from '../../domain/types/product-unit.type'

@Injectable()
export class ProductUnitServiceImpl implements ProductUnitService {
	constructor(private readonly productUnitsRepo: ProductUnitsRepository) {}

	async getProductUnitById(id: ProductUnitId): Promise<{
		found: boolean
		data?: ProductUnit
	}> {
		const result = await this.productUnitsRepo.byId(id)

		if (result) {
			return {
				found: true,
				data: result,
			}
		}

		return { found: false }
	}

	async getProductUnitByName(id: ProductUnitName): Promise<{
		found: boolean
		data?: ProductUnit
	}> {
		const result = await this.productUnitsRepo.byName(id)

		if (result) {
			return {
				found: true,
				data: result,
			}
		}

		return { found: false }
	}
}
