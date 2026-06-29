import { SetMetadata, applyDecorators } from '@nestjs/common'
import * as Swagger from '@nestjs/swagger'

export function SwaggerInternalError() {
	return applyDecorators(
		Swagger.ApiInternalServerErrorResponse({
			description: 'Internal Server Error',
			schema: {
				example: {
					success: false,
					errors: {
						code: 'SERVER_ERROR',
						message: 'Internal Server Error',
					},
				},
			},
		}),
	)
}
