import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shortLinks } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';

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
