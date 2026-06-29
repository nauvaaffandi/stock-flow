import { SetMetadata, applyDecorators } from '@nestjs/common'
import * as Swagger from '@nestjs/swagger'
import { PurchaseNotFoundException } from '../../../../modules/procurement'

export class SwaggerPurchaseNotFound {
	public static response(exp = 'pur-owkxn') {
		return {
			success: false,
			errors: PurchaseNotFoundException.response(exp),
		}
	}

	public static summary() {
		return PurchaseNotFoundException.summary
	}

	public static single(exp = 'pur-owkxn') {
		return applyDecorators(
			Swagger.ApiNotFoundResponse({
				description: SwaggerPurchaseNotFound.summary(),
				content: {
					'application/json': {
						example: SwaggerPurchaseNotFound.response(exp),
					},
				},
			}),
		)
	}
}
