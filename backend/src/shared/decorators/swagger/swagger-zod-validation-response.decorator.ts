import { SetMetadata, applyDecorators } from '@nestjs/common'
import * as Swagger from '@nestjs/swagger'

export function SwaggerZodValidationResponse() {
	return applyDecorators(
		Swagger.ApiBadRequestResponse({
			description: 'Validation failed',
			content: {
				'application/json': {
					example: {
						success: false,
						errors: {
							code: 'VALIDATION_ERROR',
							fields: ['name'],
							form: [],
						},
					},
				},
			},
		}),
	)
}
