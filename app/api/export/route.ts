import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users, cards } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user data
        const userResult = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
        const user = userResult[0];

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get user's cards
        const userCards = await db.select().from(cards).where(eq(cards.userId, user.id));

        // Create export data
        const exportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            profile: {
                name: user.name,
                username: user.username,
                bio: user.bio,
                image: user.image,
                backgroundImage: user.backgroundImage,
                profileColor: user.profileColor,
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
                'Content-Disposition': `attachment; filename="mybento-${user.username}-${Date.now()}.json"`,
            },
        });
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
    }
}
