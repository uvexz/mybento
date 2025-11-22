import { NextRequest, NextResponse } from 'next/server';
import { auth, type ExtendedSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { user, cards } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { handleApiError, createErrorResponse, COMMON_ERRORS } from '@/lib/error-handler';

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

        // 速率限制检查（导入操作更严格）
        const rateLimit = checkRateLimit(`import:${session.user.email}`, RATE_LIMITS.STRICT);

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

        const data = await request.json();

        // Validate import data
        if (!data.cards || !Array.isArray(data.cards)) {
            return NextResponse.json({ error: 'Invalid import data' }, { status: 400 });
        }

        // Limit number of cards to import
        const MAX_IMPORT_CARDS = 100;
        if (data.cards.length > MAX_IMPORT_CARDS) {
            return NextResponse.json({ 
                error: `Too many cards. Maximum ${MAX_IMPORT_CARDS} cards can be imported at once.` 
            }, { status: 400 });
        }

        // Get user
        const userResult = await db.select().from(user).where(eq(user.email, session.user.email)).limit(1);
        const userData = userResult[0];

        if (!userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Validate card types
        const validTypes = ['link', 'text', 'image', 'github', 'contact', 'mastodon'];
        const validSizes = ['small', 'medium', 'large'];

        // Import cards with validation
        const importedCards = [];
        for (const cardData of data.cards) {
            // Validate card type
            const cardType = cardData.type || 'link';
            if (!validTypes.includes(cardType)) {
                continue; // Skip invalid cards
            }

            // Validate size
            const cardSize = cardData.size || 'small';
            if (!validSizes.includes(cardSize)) {
                continue; // Skip invalid cards
            }

            // Sanitize title
            const title = (cardData.title || 'Untitled').substring(0, 200);
            const subtitle = cardData.subtitle ? cardData.subtitle.substring(0, 500) : null;

            const newCard = await db.insert(cards).values({
                userId: userData.id,
                title,
                subtitle,
                type: cardType,
                url: cardData.url || null,
                icon: cardData.icon || null,
                colorClass: cardData.colorClass || 'bg-gray-100',
                size: cardSize,
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
        const apiError = handleApiError(error, 'Import data');
        return NextResponse.json(
            createErrorResponse(apiError),
            { status: apiError.statusCode }
        );
    }
}
