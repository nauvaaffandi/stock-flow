import { SupplierAlreadyExistsException } from '../../../../modules/procurement'
import * as Swagger from '@nestjs/swagger'
import { SetMetadata, applyDecorators } from '@nestjs/common'

export class SwaggerSupplierAlreadyExists {
	public static response(supplierCode = 'example supplier code') {
		return {
			success: false,
			errors: SupplierAlreadyExistsException.response(supplierCode),
		}
	}

	public static summary() {
		return SupplierAlreadyExistsException.summary
	}

	public static single(supplierCode = 'example supplier code') {
		return applyDecorators(
			Swagger.ApiConflictResponse({
				description: SwaggerSupplierAlreadyExists.summary(),
				content: {
					'application/json': {
						example:
							SwaggerSupplierAlreadyExists.response(supplierCode),
					},
				},
			}),
		)
	}
}
