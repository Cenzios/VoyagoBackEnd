export interface ApiResponse<T = any> {
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    message: string;
    success: boolean;
    data: T | null;
    errors?: any[];
}