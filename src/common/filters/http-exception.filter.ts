import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        // Extract error message and details
        let message: string;
        let errors: any[] | undefined;

        if (typeof exceptionResponse === 'object') {
            const responseObj = exceptionResponse as any;
            message = responseObj.message || exception.message;

            // Handle validation errors
            if (Array.isArray(responseObj.message)) {
                errors = responseObj.message;
                message = 'Validation failed';
            } else if (responseObj.error) {
                message = responseObj.message || responseObj.error;
            }
        } else {
            message = exceptionResponse as string;
        }

        // Log the error
        this.logger.error(
            `${request.method} ${request.url} - ${status} - ${message}`,
            exception.stack,
        );

        // Build standardized error response
        const errorResponse: ApiResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message,
            success: false,
            data: null,
            ...(errors && { errors }),
        };

        response.status(status).json(errorResponse);
    }
}