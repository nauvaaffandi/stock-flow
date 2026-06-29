import { SetMetadata, applyDecorators } from '@nestjs/common'
import * as Swagger from '@nestjs/swagger'
import { CategoryAlreadyExistsException } from '../../../../modules/catalog'

export class SwaggerCategoryAlreadyExists {
	public static response(categoryName = 'beverage') {
		return {
			success: false,
			errors: CategoryAlreadyExistsException.response(categoryName),
		}
	}

	public static summary() {
		return CategoryAlreadyExistsException.summary
	}

	public static single(categoryName = 'beverage') {
		return applyDecorators(
			Swagger.ApiNotFoundResponse({
				description: SwaggerCategoryAlreadyExists.summary(),
				content: {
					'application/json': {
						example:
							SwaggerCategoryAlreadyExists.response(categoryName),
					},
				},
			}),
		)
	}
}
