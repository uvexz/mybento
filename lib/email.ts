// Email verification utilities using Resend
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const isEmailVerificationEnabled = !!process.env.RESEND_API_KEY;

/**
 * Generate a verification token
 */
export function generateVerificationToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Get verification token expiry (24 hours from now)
 */
export function getVerificationTokenExpiry(): Date {
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
    email: string,
    username: string,
    token: string
): Promise<{ success: boolean; error?: string }> {
    if (!resend) {
        console.warn('Email verification is disabled - RESEND_API_KEY not configured');
        return { success: false, error: 'Email service not configured' };
    }

    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    try {
        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'noreply@mybento.app',
            to: email,
            subject: 'Verify your email address',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to mybento, ${username}!</h2>
                    <p>Please verify your email address by clicking the link below:</p>
                    <p>
                        <a href="${verificationUrl}" 
                           style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px;">
                            Verify Email
                        </a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
                    <p style="color: #999; font-size: 12px; margin-top: 32px;">
                        This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
                    </p>
                </div>
            `,
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to send verification email:', error);
        return { success: false, error: 'Failed to send verification email' };
    }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
    email: string,
    username: string,
    token: string
): Promise<{ success: boolean; error?: string }> {
    if (!resend) {
        console.warn('Email service is disabled - RESEND_API_KEY not configured');
        return { success: false, error: 'Email service not configured' };
    }

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    try {
        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'noreply@mybento.app',
            to: email,
            subject: 'Reset your password',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Password Reset Request</h2>
                    <p>Hi ${username},</p>
                    <p>We received a request to reset your password. Click the link below to create a new password:</p>
                    <p>
                        <a href="${resetUrl}" 
                           style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px;">
                            Reset Password
                        </a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="color: #666; word-break: break-all;">${resetUrl}</p>
                    <p style="color: #999; font-size: 12px; margin-top: 32px;">
                        This link will expire in 24 hours. If you didn't request a password reset, you can safely ignore this email.
                    </p>
                </div>
            `,
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to send password reset email:', error);
        return { success: false, error: 'Failed to send password reset email' };
    }
}
