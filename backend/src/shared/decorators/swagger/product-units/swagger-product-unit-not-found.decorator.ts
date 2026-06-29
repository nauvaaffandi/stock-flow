import { SetMetadata, applyDecorators } from '@nestjs/common'
import * as Swagger from '@nestjs/swagger'
import { ProductUnitNotFoundException } from '../../../../modules/catalog'

export class SwaggerProductUnitNotFound {
	public static response(id = 'example unitId') {
		return {
			success: false,
			errors: ProductUnitNotFoundException.response(id),
		}
	}

	public static summary() {
		return ProductUnitNotFoundException.summary
	}

	public static single(id = 'example unitId') {
		return applyDecorators(
			Swagger.ApiNotFoundResponse({
				description: SwaggerProductUnitNotFound.summary(),
				content: {
					'application/json': {
						example: SwaggerProductUnitNotFound.response(id),
					},
				},
			}),
		)
	}
}
