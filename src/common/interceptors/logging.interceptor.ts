import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable, catchError, tap } from 'rxjs';
import { logger } from '../../logger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();
        const start = Date.now();

        const base = {
            method: req.method,
            url: req.originalUrl || req.url,
            ip: req.ip,
            userId: req.user?.id ?? 'anonymous',
        };

        return next.handle().pipe(
            tap(() => {
                const duration = Date.now() - start;

                const payload = {
                    ...base,
                    statusCode: res.statusCode,
                    duration,
                };

                if (duration > 1000) {
                    logger.warn(payload, 'SLOW_REQUEST');
                } else {
                    logger.info(payload, 'REQUEST');
                }
            }),
            catchError((err) => {
                logger.error(
                    {
                        ...base,
                        statusCode: res.statusCode,
                        error: err.message,
                        stack: err.stack,
                    },
                    'REQUEST_ERROR',
                );
                throw err;
            }),
        );
    }
}
