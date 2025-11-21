import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users, shortLinks } from '@/lib/schema';
import { eq } from 'drizzle-orm';

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
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userResult = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
        const user = userResult[0];

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const links = await db.select().from(shortLinks).where(eq(shortLinks.userId, user.id));

        return NextResponse.json({ links });
    } catch (error) {
        console.error('Get short links error:', error);
        return NextResponse.json({ error: 'Failed to get short links' }, { status: 500 });
    }
}

// POST - Create new short link
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { originalUrl, title, customCode } = await request.json();

        if (!originalUrl) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const userResult = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
        const user = userResult[0];

        if (!user) {
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
            userId: user.id,
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
        console.error('Create short link error:', error);
        return NextResponse.json({ error: 'Failed to create short link' }, { status: 500 });
    }
}

// DELETE - Delete short link
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const linkId = searchParams.get('id');

        if (!linkId) {
            return NextResponse.json({ error: 'Link ID required' }, { status: 400 });
        }

        await db.delete(shortLinks).where(eq(shortLinks.id, parseInt(linkId)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete short link error:', error);
        return NextResponse.json({ error: 'Failed to delete short link' }, { status: 500 });
    }
}
