/**
 * 统一的错误处理工具
 * 在生产环境中隐藏敏感错误信息
 */

export interface ApiError {
    message: string;
    code?: string;
    statusCode: number;
}

/**
 * 安全地处理 API 错误
 * 在生产环境中返回通用错误消息，在开发环境中返回详细信息
 */
export function handleApiError(error: unknown, context: string): ApiError {
    const isDevelopment = process.env.NODE_ENV === 'development';

    // 记录详细错误到服务器日志
    console.error(`[${context}]`, error);

    // 如果是已知的错误类型
    if (error instanceof Error) {
        // 在开发环境中返回详细错误
        if (isDevelopment) {
            return {
                message: error.message,
                code: 'INTERNAL_ERROR',
                statusCode: 500,
            };
        }

        // 检查是否是数据库错误
        if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
            return {
                message: 'This resource already exists',
                code: 'DUPLICATE_RESOURCE',
                statusCode: 409,
            };
        }

        // 检查是否是验证错误
        if (error.message.includes('validation') || error.message.includes('invalid')) {
            return {
                message: 'Invalid input data',
                code: 'VALIDATION_ERROR',
                statusCode: 400,
            };
        }
    }

    // 生产环境返回通用错误
    return {
        message: 'An unexpected error occurred. Please try again later.',
        code: 'INTERNAL_ERROR',
        statusCode: 500,
    };
}

/**
 * 创建标准化的错误响应
 */
export function createErrorResponse(error: ApiError) {
    return {
        error: error.message,
        code: error.code,
        ...(process.env.NODE_ENV === 'development' && { timestamp: new Date().toISOString() }),
    };
}

/**
 * 常见的错误响应
 */
export const COMMON_ERRORS = {
    UNAUTHORIZED: {
        message: 'Authentication required',
        code: 'UNAUTHORIZED',
        statusCode: 401,
    },
    FORBIDDEN: {
        message: 'You do not have permission to perform this action',
        code: 'FORBIDDEN',
        statusCode: 403,
    },
    NOT_FOUND: {
        message: 'Resource not found',
        code: 'NOT_FOUND',
        statusCode: 404,
    },
    BAD_REQUEST: {
        message: 'Invalid request',
        code: 'BAD_REQUEST',
        statusCode: 400,
    },
    RATE_LIMIT_EXCEEDED: {
        message: 'Too many requests. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        statusCode: 429,
    },
} as const;
