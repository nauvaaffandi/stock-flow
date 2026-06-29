import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
} from '@nestjs/common'

import { Response, Request } from 'express'

@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter {
	catch(err: any, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const res = ctx.getResponse<Response>()
		const req = ctx.getRequest<Request>()

		const status = err.getStatus()
		const response = err.getResponse()

		return res.status(status).json({
			success: false,
			errors: response,
		})
	}
}
