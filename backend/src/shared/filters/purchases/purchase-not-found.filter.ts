import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { PurchaseNotFoundException } from '../../../modules/procurement'
import { Response, Request } from 'express'

@Catch(PurchaseNotFoundException)
export class PurchaseNotFoundErrorFilter implements ExceptionFilter {
	catch(exception: any, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const res = ctx.getResponse<Response>()
		const req = ctx.getRequest<Request>()

		return res
			.status(404)
			.json({
				success: false,
				errors: exception.ApiResponse(),
			})
			.end()
	}
}
