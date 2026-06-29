import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { nanoid } from 'nanoid'
import { v4 as uuid } from 'uuid'
import { ulid } from 'ulid'

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		const id = `${ulid()}-${nanoid(17)}`

		req.headers['x-request-id'] = id
		res.setHeader('x-request-id', id)

		next()
	}
}
