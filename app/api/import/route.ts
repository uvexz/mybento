import { NextRequest, NextResponse } from 'next/server';
import { auth, type ExtendedSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { user, cards } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        }) as ExtendedSession | null;
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        // Validate import data
        if (!data.cards || !Array.isArray(data.cards)) {
            return NextResponse.json({ error: 'Invalid import data' }, { status: 400 });
        }

        // Get user
        const userResult = await db.select().from(user).where(eq(user.email, session.user.email)).limit(1);
        const userData = userResult[0];

        if (!userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Import cards
        const importedCards = [];
        for (const cardData of data.cards) {
            const newCard = await db.insert(cards).values({
                userId: userData.id,
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
            await db.update(user)
                .set({
                    name: data.profile.name || userData.name,
                    bio: data.profile.bio || userData.bio,
                    image: data.profile.image || userData.image,
                    backgroundImage: data.profile.backgroundImage || userData.backgroundImage,
                    profileColor: data.profile.profileColor || userData.profileColor,
                })
                .where(eq(user.id, userData.id));
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
