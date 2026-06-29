import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
} from '@nestjs/common'
import { ErrorTelemetryService } from '../../infrastructure/logging'
import { Response, Request } from 'express'

@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
	constructor(private readonly errorTelemetry: ErrorTelemetryService) {}

	catch(err: any, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const res = ctx.getResponse<Response>()
		const req = ctx.getRequest<Request>()

		this.errorTelemetry.logger.error('Server Error occured', {
			method: req.method,
			reqId: req.headers['x-request-id'] || 'reqId-undefined',
			path: req.url,
			stack: err.stack,
		})

		return res.status(500).json({
			success: false,
			errors: {
				code: 'SERVER_ERROR',
				message: 'Internal Server Error',
			},
		})
	}
}
