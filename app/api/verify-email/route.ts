import { NextResponse } from 'next/server';

/**
 * @deprecated This endpoint is deprecated. Email verification is now handled by Better Auth.
 * Better Auth provides built-in email verification functionality.
 * This endpoint is kept for backward compatibility but should not be used.
 */
export async function POST() {
    return NextResponse.json(
        { 
            error: 'This endpoint is deprecated. Email verification is now handled by Better Auth.',
            message: 'Please use Better Auth\'s built-in email verification system.'
        },
        { status: 410 } // 410 Gone - indicates the resource is no longer available
    );
}
