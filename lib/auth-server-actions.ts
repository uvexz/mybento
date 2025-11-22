'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import { validatePasswordStrength } from '@/lib/password';
import { sanitizeUsername, sanitizeEmail, isValidEmail } from '@/lib/sanitize';
import { isRegistrationOpen } from '@/lib/data';

const RegisterSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(50),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function registerUser(formData: {
    username: string;
    email: string;
    password: string;
}) {
    // 检查注册是否开放
    const registrationOpen = await isRegistrationOpen();
    if (!registrationOpen) {
        return { error: 'Registration is currently closed.' };
    }

    // 清理输入
    const cleanUsername = sanitizeUsername(formData.username);
    const cleanEmail = sanitizeEmail(formData.email);

    // 验证邮箱格式
    if (!isValidEmail(cleanEmail)) {
        return { error: 'Invalid email address' };
    }

    // 验证字段
    const validatedFields = RegisterSchema.safeParse({
        username: cleanUsername,
        email: cleanEmail,
        password: formData.password,
    });

    if (!validatedFields.success) {
        const errors = validatedFields.error.issues;
        return { error: errors[0]?.message || 'Invalid fields' };
    }

    const { email, password, username } = validatedFields.data;

    // 检查密码强度
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.isValid) {
        return { error: 'Password is too weak. ' + passwordCheck.feedback.join('. ') };
    }

    try {
        // 使用 Better Auth API 注册用户
        const result = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name: username,
                username, // 自定义字段
            },
            headers: await headers(),
        });

        return { success: true, user: result.user };
    } catch (error: any) {
        console.error('Registration error:', error);
        // 检查是否是已存在的用户
        if (error.message?.includes('unique') || error.message?.includes('already exists')) {
            return { error: 'Email or username already in use' };
        }
        return { error: error.message || 'Something went wrong.' };
    }
}

export async function loginUser(formData: {
    email: string;
    password: string;
}) {
    const cleanEmail = sanitizeEmail(formData.email);

    if (!isValidEmail(cleanEmail)) {
        return { error: 'Invalid email address' };
    }

    try {
        const result = await auth.api.signInEmail({
            body: {
                email: cleanEmail,
                password: formData.password,
            },
            headers: await headers(),
        });

        return { success: true, user: result.user };
    } catch (error: any) {
        console.error('Login error:', error);
        if (error.message?.includes('Invalid') || error.message?.includes('credentials')) {
            return { error: 'Invalid email or password' };
        }
        return { error: error.message || 'Something went wrong.' };
    }
}
