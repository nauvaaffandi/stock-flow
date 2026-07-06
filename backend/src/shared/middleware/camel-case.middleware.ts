import { Injectable, NestMiddleware } from '@nestjs/common'
import camelcaseKeys from 'camelcase-keys'

@Injectable()
export class CamelCaseMiddleware implements NestMiddleware {
	use(req: any, res: any, next: () => void) {
		if (req.body && typeof req.body === 'object') {
			req.body = camelcaseKeys(req.body, { deep: true })
		}
        
		next()
	}
}