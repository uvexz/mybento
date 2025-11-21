import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq, and, gt } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        // Find user with valid token
        const userResult = await db
            .select()
            .from(users)
            .where(
                and(
                    eq(users.verificationToken, token),
                    gt(users.verificationTokenExpiry, new Date())
                )
            )
            .limit(1);

        const user = userResult[0];

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid or expired verification token' },
                { status: 400 }
            );
        }

        // Update user as verified
        await db
            .update(users)
            .set({
                emailVerified: true,
                verificationToken: null,
                verificationTokenExpiry: null,
            })
            .where(eq(users.id, user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        );
    }
}
