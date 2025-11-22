import { NextRequest, NextResponse } from 'next/server';
import { auth, type ExtendedSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { user, shortLinks } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { handleApiError, createErrorResponse, COMMON_ERRORS } from '@/lib/error-handler';

// Generate random short code
function generateShortCode(length = 6): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// GET - List user's short links
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        }) as ExtendedSession | null;
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userResult = await db.select().from(user).where(eq(user.email, session.user.email)).limit(1);
        const userData = userResult[0];

        if (!userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const links = await db.select().from(shortLinks).where(eq(shortLinks.userId, userData.id));

        return NextResponse.json({ links });
    } catch (error) {
        const apiError = handleApiError(error, 'Get short links');
        return NextResponse.json(
            createErrorResponse(apiError),
            { status: apiError.statusCode }
        );
    }
}

// Validate URL
function isValidUrl(url: string): boolean {
    try {
        const parsedUrl = new URL(url);
        // Only allow http and https protocols
        return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
        return false;
    }
}

// POST - Create new short link
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        }) as ExtendedSession | null;
        
        if (!session?.user?.email) {
            return NextResponse.json(
                createErrorResponse(COMMON_ERRORS.UNAUTHORIZED),
                { status: 401 }
            );
        }

        // 速率限制检查
        const clientId = getClientIdentifier(request);
        const rateLimit = checkRateLimit(`create-link:${session.user.email}`, RATE_LIMITS.MODERATE);

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

        const { originalUrl, title, customCode } = await request.json();

        if (!originalUrl) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Validate URL
        if (!isValidUrl(originalUrl)) {
            return NextResponse.json({ error: 'Invalid URL. Only HTTP and HTTPS URLs are allowed.' }, { status: 400 });
        }

        const userResult = await db.select().from(user).where(eq(user.email, session.user.email)).limit(1);
        const userData = userResult[0];

        if (!userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate or use custom short code
        let shortCode = customCode || generateShortCode();

        // Check if code already exists
        if (customCode) {
            const existing = await db.select().from(shortLinks).where(eq(shortLinks.shortCode, customCode)).limit(1);
            if (existing.length > 0) {
                return NextResponse.json({ error: 'Custom code already taken' }, { status: 400 });
            }
        } else {
            // Ensure generated code is unique
            let attempts = 0;
            while (attempts < 10) {
                const existing = await db.select().from(shortLinks).where(eq(shortLinks.shortCode, shortCode)).limit(1);
                if (existing.length === 0) break;
                shortCode = generateShortCode();
                attempts++;
            }
        }

        // Create short link
        const newLink = await db.insert(shortLinks).values({
            userId: userData.id,
            shortCode,
            originalUrl,
            title: title || null,
        }).returning();

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const shortUrl = `${siteUrl}/s/${shortCode}`;

        return NextResponse.json({
            success: true,
            link: newLink[0],
            shortUrl,
        });
    } catch (error) {
        const apiError = handleApiError(error, 'Create short link');
        return NextResponse.json(
            createErrorResponse(apiError),
            { status: apiError.statusCode }
        );
    }
}

// DELETE - Delete short link
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        }) as ExtendedSession | null;
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const linkId = searchParams.get('id');

        if (!linkId) {
            return NextResponse.json({ error: 'Link ID required' }, { status: 400 });
        }

        // Get user
        const userResult = await db.select().from(user).where(eq(user.email, session.user.email)).limit(1);
        const userData = userResult[0];

        if (!userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify ownership before deleting
        const linkResult = await db.select().from(shortLinks).where(eq(shortLinks.id, parseInt(linkId))).limit(1);
        const link = linkResult[0];

        if (!link) {
            return NextResponse.json({ error: 'Link not found' }, { status: 404 });
        }

        if (link.userId !== userData.id) {
            return NextResponse.json({ error: 'Forbidden: You do not own this link' }, { status: 403 });
        }

        await db.delete(shortLinks).where(eq(shortLinks.id, parseInt(linkId)));

        return NextResponse.json({ success: true });
    } catch (error) {
        const apiError = handleApiError(error, 'Delete short link');
        return NextResponse.json(
            createErrorResponse(apiError),
            { status: apiError.statusCode }
        );
    }
}
