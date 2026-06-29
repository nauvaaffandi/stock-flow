import { SetMetadata, applyDecorators } from '@nestjs/common'
import * as Swagger from '@nestjs/swagger'
import { ProductNotFoundException } from '../../../../modules/catalog'

export class SwaggerProductNotFound {
	public static response(id = 'product-293838') {
		return {
			success: false,
			errors: ProductNotFoundException.response(id),
		}
	}

	public static summary() {
		return ProductNotFoundException.summary
	}

	public static single(id = 'product-293838') {
		return applyDecorators(
			Swagger.ApiNotFoundResponse({
				description: SwaggerProductNotFound.summary(),
				content: {
					'application/json': {
						example: SwaggerProductNotFound.response(id),
					},
				},
			}),
		)
	}
}
