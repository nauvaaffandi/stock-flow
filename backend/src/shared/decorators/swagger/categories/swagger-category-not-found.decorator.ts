import { SetMetadata, applyDecorators } from '@nestjs/common'
import * as Swagger from '@nestjs/swagger'
import { CategoryNotFoundException } from '../../../../modules/catalog'

export class SwaggerCategoryNotFound {
	public static response(categoryName = 'narkoba') {
		return {
			success: false,
			errors: CategoryNotFoundException.response(categoryName),
		}
	}

	public static summary() {
		return CategoryNotFoundException.summary
	}

	public static single(categoryName = 'narkoba') {
		return applyDecorators(
			Swagger.ApiNotFoundResponse({
				description: SwaggerCategoryNotFound.summary(),
				content: {
					'application/json': {
						example: SwaggerCategoryNotFound.response(categoryName),
					},
				},
			}),
		)
	}
}
