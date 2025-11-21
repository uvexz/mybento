import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users, cards } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        // Validate import data
        if (!data.cards || !Array.isArray(data.cards)) {
            return NextResponse.json({ error: 'Invalid import data' }, { status: 400 });
        }

        // Get user
        const userResult = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
        const user = userResult[0];

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Import cards
        const importedCards = [];
        for (const cardData of data.cards) {
            const newCard = await db.insert(cards).values({
                userId: user.id,
                title: cardData.title || 'Untitled',
                subtitle: cardData.subtitle || null,
                type: cardData.type || 'link',
                url: cardData.url || null,
                icon: cardData.icon || null,
                colorClass: cardData.colorClass || 'bg-gray-100',
                size: cardData.size || 'small',
                order: cardData.order || 0,
            }).returning();

            importedCards.push(newCard[0]);
        }

        // Update profile if provided
        if (data.profile) {
            await db.update(users)
                .set({
                    name: data.profile.name || user.name,
                    bio: data.profile.bio || user.bio,
                    image: data.profile.image || user.image,
                    backgroundImage: data.profile.backgroundImage || user.backgroundImage,
                    profileColor: data.profile.profileColor || user.profileColor,
                })
                .where(eq(users.id, user.id));
        }

        return NextResponse.json({
            success: true,
            imported: importedCards.length,
        });
    } catch (error) {
        console.error('Import error:', error);
        return NextResponse.json({ error: 'Failed to import data' }, { status: 500 });
    }
}
