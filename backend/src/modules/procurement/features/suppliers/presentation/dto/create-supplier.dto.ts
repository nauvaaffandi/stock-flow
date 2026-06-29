import * as Swagger from '@nestjs/swagger'

export class CreateSupplierDto {
	@Swagger.ApiProperty({
		required: true,
		example: 'Development supplier',
	})
	name: string

	@Swagger.ApiProperty({
		required: true,
		example: 'SUB/DEV/XYZ',
	})
	code: string

	@Swagger.ApiProperty({
		required: false,
		example: '0851-xxxx-zzzz',
	})
	phone: string | null

	@Swagger.ApiProperty({
		required: false,
		example: null,
	})
	address: string | null
}
