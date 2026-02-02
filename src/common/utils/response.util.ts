import { ApiResponse } from '../interfaces/api-response.interface';

export class ResponseUtil {
    static success<T>(
        data: T,
        message = 'Request successful',
        statusCode = 200,
    ): ApiResponse<T> {
        return {
            statusCode,
            timestamp: new Date().toISOString(),
            path: '',
            method: '',
            message,
            success: true,
            data,
        };
    }

    static error(
        message: string,
        statusCode = 400,
        errors?: any[],
    ): ApiResponse {
        return {
            statusCode,
            timestamp: new Date().toISOString(),
            path: '',
            method: '',
            message,
            success: false,
            data: null,
            ...(errors && { errors }),
        };
    }
}