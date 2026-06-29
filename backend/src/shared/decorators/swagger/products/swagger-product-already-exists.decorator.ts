import { SetMetadata, applyDecorators } from '@nestjs/common'
import * as Swagger from '@nestjs/swagger'
import { ProductAlreadyExistsException } from '../../../../modules/catalog'

export class SwaggerProductAlreadyExists {
	public static response(productName = 'dimsum daging tikus') {
		return {
			success: false,
			errors: ProductAlreadyExistsException.response(productName),
		}
	}

	public static summary() {
		return ProductAlreadyExistsException.summary
	}

	public static single(productName = 'dimsum daging tikus') {
		return applyDecorators(
			Swagger.ApiConflictResponse({
				description: SwaggerProductAlreadyExists.summary(),
				content: {
					'application/json': {
						example:
							ProductAlreadyExistsException.response(productName),
					},
				},
			}),
		)
	}
}
