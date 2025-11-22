import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shortLinks } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';

// Validate URL to prevent open redirect attacks
function isValidRedirectUrl(url: string): boolean {
    try {
        const parsedUrl = new URL(url);
        // Allow http and https protocols only
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            return false;
        }
        // Reject javascript:, data:, file:, etc.
        return true;
    } catch {
        return false;
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;

        // Find short link
        const linkResult = await db.select().from(shortLinks).where(eq(shortLinks.shortCode, code)).limit(1);
        const link = linkResult[0];

        if (!link) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // Validate URL before redirecting
        if (!isValidRedirectUrl(link.originalUrl)) {
            console.warn(`Blocked invalid redirect URL: ${link.originalUrl}`);
            return NextResponse.redirect(new URL('/', request.url));
        }

        // Increment click count
        await db.update(shortLinks)
            .set({ clicks: sql`${shortLinks.clicks} + 1` })
            .where(eq(shortLinks.id, link.id));

        // Redirect to original URL
        return NextResponse.redirect(link.originalUrl);
    } catch (error) {
        console.error('Short link redirect error:', error);
        return NextResponse.redirect(new URL('/', request.url));
    }
}
