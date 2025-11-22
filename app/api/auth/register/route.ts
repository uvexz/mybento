import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { isRegistrationOpen } from '@/lib/data';
import { db } from '@/lib/db';
import { user } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { handleApiError, createErrorResponse, COMMON_ERRORS } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
    try {
        // 速率限制检查
        const clientId = getClientIdentifier(request);
        const rateLimit = checkRateLimit(`register:${clientId}`, RATE_LIMITS.STRICT);

        if (!rateLimit.success) {
            return NextResponse.json(
                createErrorResponse(COMMON_ERRORS.RATE_LIMIT_EXCEEDED),
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': rateLimit.limit.toString(),
                        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                        'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
                    },
                }
            );
        }

        // 检查注册是否开放
        const registrationOpen = await isRegistrationOpen();
        if (!registrationOpen) {
            return NextResponse.json(
                { error: 'Registration is currently closed.' },
                { status: 403 }
            );
        }

        // 获取请求体
        const body = await request.json();
        const { email, password, username, name } = body;

        // 验证必填字段
        if (!email || !password || !username) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // 检查是否是第一个用户
        const userCount = await db.select({ count: sql<number>`count(*)` }).from(user);
        const isFirstUser = Number(userCount[0]?.count || 0) === 0;

        // 使用 Better Auth 注册
        const result = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name: name || username,
                username,
            },
            headers: request.headers,
        });

        // 如果是第一个用户，将其设置为管理员
        if (isFirstUser && result && 'user' in result) {
            await db.update(user)
                .set({ role: 'admin' })
                .where(eq(user.id, result.user.id));
        }

        // 检查是否配置了邮箱验证
        const requiresVerification = !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

        return NextResponse.json({
            ...result,
            requiresVerification,
        });
    } catch (error: any) {
        const apiError = handleApiError(error, 'Registration');
        return NextResponse.json(
            createErrorResponse(apiError),
            { status: apiError.statusCode }
        );
    }
}
