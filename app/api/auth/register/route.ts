import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { isRegistrationOpen } from '@/lib/data';

export async function POST(request: NextRequest) {
    try {
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

        // 检查是否配置了邮箱验证
        const requiresVerification = !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

        return NextResponse.json({
            ...result,
            requiresVerification,
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: error.message || 'Registration failed' },
            { status: 500 }
        );
    }
}
