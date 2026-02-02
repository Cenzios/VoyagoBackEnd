import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiSuccessResponse(message: string, dataType?: any) {
    return applyDecorators(
        ApiResponse({
            status: 200,
            description: message,
            type: dataType,
        }),
    );
}

export function ApiErrorResponse(message: string, status: number = 400) {
    return applyDecorators(
        ApiResponse({
            status,
            description: message,
        }),
    );
}