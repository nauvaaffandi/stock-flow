import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
} from '@nestjs/common'

import { Response, Request } from 'express'
import { ZodError } from 'zod'

@Catch(ZodError)
export class ZodErrorFilter implements ExceptionFilter {
	catch(err: any, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const res = ctx.getResponse<Response>()
		const req = ctx.getRequest<Request>()

		return res.status(400).json({
			success: false,
			errors: {
				code: 'VALIDATION_ERROR',
				fields: err.flatten().fieldErrors,
				form: err.flatten().formErrors,
			},
		})
	}
}
