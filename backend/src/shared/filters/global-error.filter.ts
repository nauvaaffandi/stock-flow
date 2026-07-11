import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
} from '@nestjs/common'
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
            requestId: req.headers['x-request-id'] || 'reqId-xx',
            context: 'SERVER_ERROR',
            trace: err.stack,
            http: {
                path: req.originalUrl,
                method: req.method,
                statusCode: 500,
                duration: performance.now() - req.system.startTime,
            },
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
