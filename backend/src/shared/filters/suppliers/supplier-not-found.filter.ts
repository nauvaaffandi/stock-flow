import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { SupplierNotFoundException } from '../../../modules/procurement'
import { Response, Request } from 'express'

@Catch(SupplierNotFoundException)
export class SupplierNotFoundErrorFilter implements ExceptionFilter {
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
