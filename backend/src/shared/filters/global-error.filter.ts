import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
} from '@nestjs/common'
import { ErrorTelemetryService } from '../../infrastructure/logging'
import { Response, Request } from 'express'
import { LoggerService } from '../../infrastructure/logging/logger.service'


@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
	constructor(
        private readonly logger: LoggerService
    ) {}

	catch(err: any, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const res = ctx.getResponse<Response>()
		const req = ctx.getRequest<Request>()
        
        this.logger.error({
            message: 'Server Error Occured',
            method: req.method,
            requestId: req.headers['x-request-id'] || 'reqId-xx',
            path: err.url,
            context: 'SERVER_ERROR',
            statusCode: 500,
            stack: err.stack,
            metadata: {
                ...(err.code ? { code: err.code } : {}),
                ...(err.name ? { name: err.name } : {}),
                ...(err.errno ? { errno: err.errno } : {}),
                ...(err.detail ? { detail: err.detail } : {}),
                ...(err.hint ? { hint: err.hint } : {}),
                ...(err.schema ? { schema: err.schema } : {}),
                ...(err.table ? { table: err.table } : {}),
                ...(err.column ? { column: err.column } : {}),
                ...(err.constraint ? { constraint: err.constraint } : {}),
                ...(err.routine ? { routine: err.routine } : {}),
                ...(err.cause ? { cause: err.cause } : {}),
            },
            service: 'global-error-filter',
            duration: Date.now() - req.system.startTime
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
