// Simple in-memory rate limiting
// For production, consider using Redis or a dedicated rate limiting service

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetAt < now) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetAt: number;
}

export function checkRateLimit(
    identifier: string,
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000 // 15 minutes
): RateLimitResult {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    if (!entry || entry.resetAt < now) {
        // Create new entry
        const resetAt = now + windowMs;
        rateLimitStore.set(identifier, { count: 1, resetAt });
        return { success: true, remaining: maxAttempts - 1, resetAt };
    }

    if (entry.count >= maxAttempts) {
        // Rate limit exceeded
        return { success: false, remaining: 0, resetAt: entry.resetAt };
    }

    // Increment count
    entry.count++;
    rateLimitStore.set(identifier, entry);
    return { success: true, remaining: maxAttempts - entry.count, resetAt: entry.resetAt };
}

export function resetRateLimit(identifier: string): void {
    rateLimitStore.delete(identifier);
}

// Get client IP from request headers
export function getClientIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    
    if (realIp) {
        return realIp;
    }
    
    return 'unknown';
}
