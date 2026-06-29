import { SetMetadata, applyDecorators } from '@nestjs/common'
import * as Swagger from '@nestjs/swagger'
import { SupplierNotFoundException } from '../../../../modules/procurement'

export class SwaggerSupplierNotFound {
	public static response(name = 'PT bumi') {
		return {
			success: false,
			errors: SupplierNotFoundException.response(name),
		}
	}

	public static summary() {
		return SupplierNotFoundException.summary
	}

	public static single(name = 'PT bumi') {
		return applyDecorators(
			Swagger.ApiNotFoundResponse({
				description: SwaggerSupplierNotFound.summary(),
				content: {
					'application/json': {
						example: SwaggerSupplierNotFound.response(name),
					},
				},
			}),
		)
	}
}
