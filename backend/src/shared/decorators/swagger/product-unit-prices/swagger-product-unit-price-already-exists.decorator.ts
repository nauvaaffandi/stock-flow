import { SetMetadata, applyDecorators } from '@nestjs/common'
import * as Swagger from '@nestjs/swagger'
import { ProductUnitPriceAlreadyExistsException } from '../../../../modules/catalog'

export class SwaggerProductUnitPriceAlreadyExists {
	public static response(categoryName = 'pack') {
		return {
			success: false,
			errors: ProductUnitPriceAlreadyExistsException.response(
				categoryName,
			),
		}
	}

	public static summary() {
		return ProductUnitPriceAlreadyExistsException.summary
	}

	public static single(categoryName = 'pack') {
		return applyDecorators(
			Swagger.ApiConflictResponse({
				description: SwaggerProductUnitPriceAlreadyExists.summary(),
				content: {
					'application/json': {
						example:
							SwaggerProductUnitPriceAlreadyExists.response(
								categoryName,
							),
					},
				},
			}),
		)
	}
}
