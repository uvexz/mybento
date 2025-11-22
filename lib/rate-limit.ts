/**
 * 简单的内存速率限制器
 * 生产环境建议使用 Redis 或其他持久化存储
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// 清理过期的条目（每5分钟运行一次）
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
    maxRequests: number;  // 最大请求数
    windowMs: number;     // 时间窗口（毫秒）
}

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

/**
 * 检查速率限制
 * @param identifier 唯一标识符（如 IP 地址或用户 ID）
 * @param config 速率限制配置
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    // 如果没有记录或已过期，创建新记录
    if (!entry || now > entry.resetTime) {
        const resetTime = now + config.windowMs;
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime,
        });

        return {
            success: true,
            limit: config.maxRequests,
            remaining: config.maxRequests - 1,
            reset: resetTime,
        };
    }

    // 检查是否超过限制
    if (entry.count >= config.maxRequests) {
        return {
            success: false,
            limit: config.maxRequests,
            remaining: 0,
            reset: entry.resetTime,
        };
    }

    // 增加计数
    entry.count++;
    rateLimitStore.set(identifier, entry);

    return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests - entry.count,
        reset: entry.resetTime,
    };
}

/**
 * 从请求中获取客户端标识符
 */
export function getClientIdentifier(request: Request): string {
    // 尝试从各种头部获取真实 IP
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');

    const ip = cfConnectingIp || realIp || forwarded?.split(',')[0] || 'unknown';
    return ip.trim();
}

/**
 * 预定义的速率限制配置
 */
export const RATE_LIMITS = {
    // 严格限制：登录、注册等敏感操作
    STRICT: {
        maxRequests: 5,
        windowMs: 15 * 60 * 1000, // 15分钟
    },
    // 中等限制：一般 API 操作
    MODERATE: {
        maxRequests: 30,
        windowMs: 60 * 1000, // 1分钟
    },
    // 宽松限制：读取操作
    RELAXED: {
        maxRequests: 100,
        windowMs: 60 * 1000, // 1分钟
    },
} as const;
