import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { ProductNotFoundException } from '../../../modules/catalog'
import { Response, Request } from 'express'

@Catch(ProductNotFoundException)
export class ProductNotFoundErrorFilter implements ExceptionFilter {
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
