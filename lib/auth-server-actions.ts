'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import { validatePasswordStrength } from '@/lib/password';
import { sanitizeUsername, sanitizeEmail, isValidEmail } from '@/lib/sanitize';
import { isRegistrationOpen } from '@/lib/data';

// ============================================================================
// Validation Schemas
// ============================================================================

const RegisterSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(50),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ============================================================================
// Auth Actions
// ============================================================================

export async function registerUser(formData: { username: string; email: string; password: string }) {
    if (!await isRegistrationOpen()) {
        return { error: 'Registration is currently closed.' };
    }

    const cleanUsername = sanitizeUsername(formData.username);
    const cleanEmail = sanitizeEmail(formData.email);

    if (!isValidEmail(cleanEmail)) {
        return { error: 'Invalid email address' };
    }

    const validated = RegisterSchema.safeParse({
        username: cleanUsername,
        email: cleanEmail,
        password: formData.password,
    });

    if (!validated.success) {
        return { error: validated.error.issues[0]?.message || 'Invalid fields' };
    }

    const { email, password, username } = validated.data;

    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.isValid) {
        return { error: 'Password is too weak. ' + passwordCheck.feedback.join('. ') };
    }

    try {
        const result = await auth.api.signUpEmail({
            body: { email, password, name: username, username },
            headers: await headers(),
        });
        return { success: true, user: result.user };
    } catch (error) {
        console.error('Registration error:', error);
        const errMsg = error instanceof Error ? error.message : '';
        if (errMsg.includes('unique') || errMsg.includes('already exists')) {
            return { error: 'Email or username already in use' };
        }
        return { error: errMsg || 'Something went wrong.' };
    }
}

export async function loginUser(formData: { email: string; password: string }) {
    const cleanEmail = sanitizeEmail(formData.email);

    if (!isValidEmail(cleanEmail)) {
        return { error: 'Invalid email address' };
    }

    try {
        const result = await auth.api.signInEmail({
            body: { email: cleanEmail, password: formData.password },
            headers: await headers(),
        });
        return { success: true, user: result.user };
    } catch (error) {
        console.error('Login error:', error);
        const errMsg = error instanceof Error ? error.message : '';
        if (errMsg.includes('Invalid') || errMsg.includes('credentials')) {
            return { error: 'Invalid email or password' };
        }
        return { error: errMsg || 'Something went wrong.' };
    }
}
