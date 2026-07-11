import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable, catchError, tap, throwError } from 'rxjs'
import { LoggerService } from '@logger/logger.service'
import { SKIP_ACCESS_LOG_KEY } from '../decorators/skip-access-log.decorator'

@Injectable()
export class AccessLoggingInterceptor implements NestInterceptor {
    constructor(
        private readonly reflector: Reflector,
        private readonly logger: LoggerService
    ) {}
    
    intercept(
        context: ExecutionContext,
        next: CallHandler
    ): Observable<unknown> {
        const http = context.switchToHttp()
        
        const req = http.getRequest()
        const res = http.getResponse()
        
        const skip = this.reflector.getAllAndOverride<boolean>(
            SKIP_ACCESS_LOG_KEY,
            [
                context.getHandler(),
                context.getClass(),
            ],
        )
        
        if (skip) return next.handle()
        
        return next.handle().pipe(
            tap(() => {
                const duration = performance.now() - req.system.startTime
                
                this.logger.access({
                    message: 'HTTP request completed',
                    context: 'HTTP',
                    requestId: req.headers['x-request-id'],
                    http: {
                        method: req.method,
                        path: req.originalUrl,
                        statusCode: res.statusCode,
                        duration,
                    },
                    metadata: {
                        controller: context.getClass().name,
                        handler: context.getHandler().name,
                        body: req.body ?? {},
                        ip: req.ip,
                        userAgent: req.headers['user-agent'],
                        contentType: req.headers['content-type'],
                        contentLength: req.headers['content-length'],
                        referer: req.headers.referer,
                    },
                    service: 'stock-flow',
                })
            }),
            
            catchError(error => {
                const duration = performance.now() - req.system.startTime
                
                this.logger.error({
                    message: 'HTTP request failed',
                    context: 'HTTP',
                    requestId: req.headers['x-request-id'],
                    http: {
                        method: req.method,
                        path: req.originalUrl,
                        statusCode: error.status ?? res.statusCode ?? 500,
                        duration,
                    },
                    metadata: {
                        controller: context.getClass().name,
                        handler: context.getHandler().name,
                        name: error.name,
                        message: error.message,
                        status: error.status,
                        ip: req.ip,
                        userAgent: req.headers['user-agent'],
                        contentType: req.headers['content-type'],
                        contentLength: req.headers['content-length'],
                        referer: req.headers.referer,
                    },
                    trace: error.stack,
                    service: 'stock-flow',
                })
                
                return throwError(() => error)
            })
        )
    }   
}