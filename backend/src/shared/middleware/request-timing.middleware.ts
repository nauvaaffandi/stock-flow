import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestTimingMiddleware implements NestMiddleware {
    use(req: Request, _res: Response, next: NextFunction) {
        (req as any).system ??= {};
        (req as any).system.startTime = performance.now();
        
        next();
    }
}


