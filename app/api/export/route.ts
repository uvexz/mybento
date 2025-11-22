import { NextRequest, NextResponse } from 'next/server';
import { auth, type ExtendedSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { user, cards } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        }) as ExtendedSession | null;
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user data
        const userResult = await db.select().from(user).where(eq(user.email, session.user.email)).limit(1);
        const userData = userResult[0];

        if (!userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get user's cards
        const userCards = await db.select().from(cards).where(eq(cards.userId, userData.id));

        // Create export data
        const exportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            profile: {
                name: userData.name,
                username: userData.username,
                bio: userData.bio,
                image: userData.image,
                backgroundImage: userData.backgroundImage,
                profileColor: userData.profileColor,
            },
            cards: userCards.map(card => ({
                title: card.title,
                subtitle: card.subtitle,
                type: card.type,
                url: card.url,
                icon: card.icon,
                colorClass: card.colorClass,
                size: card.size,
                order: card.order,
            })),
        };

        // Return as JSON file download
        return new NextResponse(JSON.stringify(exportData, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="mybento-${userData.username}-${Date.now()}.json"`,
            },
        });
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
    }
}
