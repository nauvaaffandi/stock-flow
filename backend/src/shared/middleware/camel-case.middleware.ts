import { Injectable, NestMiddleware } from '@nestjs/common'
import camelcaseKeys from 'camelcase-keys'

@Injectable()
export class CamelCaseMiddleware implements NestMiddleware {
	use(req: any, res: any, next: () => void) {
		if (req.body) {
			req.body = camelcaseKeys(req.body, { deep: true })
		}
        
		if (req.query) {
			req.query = camelcaseKeys(req.query, { deep: true })
		}
        
		if (req.params) {
			req.params = camelcaseKeys(req.params, { deep: true })
		}
        
		next()
	}
}