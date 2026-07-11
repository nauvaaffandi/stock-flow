import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common'
import snakecaseKeys from 'snakecase-keys'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable()
export class SnakeCaseInterceptor implements NestInterceptor {
	intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Observable<any> {
		return next.handle().pipe(
			map((data) => {
                if (
                    data == null ||
                    typeof data !== 'object' ||
                    data instanceof Date
                ) {
                    return data
                }
                
                return snakecaseKeys(data, { deep: true })
            })
		)
	}
}