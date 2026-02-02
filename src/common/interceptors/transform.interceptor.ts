import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, ApiResponse<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<ApiResponse<T>> {
        const request = context.switchToHttp().getRequest<Request>();
        const statusCode = context.switchToHttp().getResponse().statusCode;

        return next.handle().pipe(
            map((data) => {
                // If data already has the standard format, return it
                if (data && typeof data === 'object' && 'success' in data) {
                    return data;
                }

                // Transform to standard format
                return {
                    statusCode,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    method: request.method,
                    message: this.extractMessage(data) || 'Request successful',
                    success: true,
                    data: this.extractData(data),
                };
            }),
        );
    }

    private extractMessage(data: any): string | null {
        if (typeof data === 'object' && data !== null) {
            if ('message' in data && typeof data.message === 'string') {
                return data.message;
            }
        }
        return null;
    }

    private extractData(data: any): any {
        if (typeof data === 'object' && data !== null) {
            // If it has a 'data' property, use that
            if ('data' in data) {
                return data.data;
            }
            // If it has a 'message' property only, remove it from data
            if ('message' in data) {
                const { message, ...rest } = data;
                return Object.keys(rest).length > 0 ? rest : data;
            }
        }
        return data;
    }
}