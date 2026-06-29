import * as Swagger from '@nestjs/swagger'

import type { CategoryName } from '../../../../domain/types/category.type'

export class CreateCategoryDto {
	@Swagger.ApiProperty({
		example: 'dev-testing',
		required: true,
	})
	name: CategoryName
}
