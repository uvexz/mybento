'use server';

import { db } from '@/lib/db';
import { user, cards, cardClicks, pages, userPermissions } from '@/lib/schema';
import { eq, asc, sql, and, count } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import type { BentoCardProps } from '@/lib/types';

// ============================================================================
// Helper Functions
// ============================================================================

type AuthResult = { user: typeof user.$inferSelect } | { error: string };

async function getAuthenticatedUser(): Promise<AuthResult> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.email) {
        return { error: 'Not authenticated' };
    }

    const userResult = await db.select().from(user).where(eq(user.email, session.user.email)).limit(1);
    const userData = userResult[0];

    if (!userData) {
        return { error: 'User not found' };
    }

    return { user: userData };
}

async function verifyCardOwnership(cardId: string, userId: string): Promise<{ card: typeof cards.$inferSelect } | { error: string }> {
    const cardResult = await db.select().from(cards).where(eq(cards.id, cardId)).limit(1);
    const card = cardResult[0];

    if (!card) {
        return { error: 'Card not found' };
    }

    if (card.userId !== userId) {
        return { error: 'Forbidden: You do not own this card' };
    }

    return { card };
}

async function verifyPageOwnership(pageId: string, userId: string): Promise<{ page: typeof pages.$inferSelect } | { error: string }> {
    const pageResult = await db.select().from(pages).where(eq(pages.id, pageId)).limit(1);
    const page = pageResult[0];

    if (!page || page.userId !== userId) {
        return { error: 'Forbidden: You do not own this page' };
    }

    return { page };
}

// ============================================================================
// Profile Actions
// ============================================================================

export async function updateProfile(formData: FormData) {
    const authResult = await getAuthenticatedUser();
    if ('error' in authResult) return authResult;

    const { user: userData } = authResult;

    try {
        await db.update(user).set({
            name: formData.get('name') as string,
            bio: formData.get('bio') as string,
            image: formData.get('image') as string,
            backgroundImage: formData.get('backgroundImage') as string,
            profileColor: formData.get('profileColor') as string,
        }).where(eq(user.id, userData.id));

        return { success: true };
    } catch (error) {
        console.error('Update profile error:', error);
        return { error: 'Failed to update profile' };
    }
}

// ============================================================================
// Page Actions
// ============================================================================

export async function createPage(data: { slug: string; title: string }) {
    const authResult = await getAuthenticatedUser();
    if ('error' in authResult) return authResult;

    const { user: userData } = authResult;

    // Check page limits
    const permissionsResult = await db.select().from(userPermissions).where(eq(userPermissions.userId, userData.id)).limit(1);
    const maxPages = permissionsResult[0]?.maxPages ?? 3;

    const pagesCountResult = await db.select({ count: count() }).from(pages).where(eq(pages.userId, userData.id));
    const pagesCount = pagesCountResult[0]?.count || 0;

    if (userData.role !== 'admin' && pagesCount >= maxPages) {
        return { error: `You have reached the limit of ${maxPages} pages.` };
    }

    try {
        // Check if slug already exists for this user
        const existingPage = await db.select().from(pages).where(
            and(eq(pages.userId, userData.id), eq(pages.slug, data.slug))
        ).limit(1);

        if (existingPage.length > 0) {
            return { error: 'Page with this URL already exists' };
        }

        await db.insert(pages).values({
            userId: userData.id,
            slug: data.slug,
            title: data.title,
            subtitle: '',
            avatarUrl: userData.image,
        });

        return { success: true };
    } catch (error) {
        console.error('Create page error:', error);
        return { error: 'Failed to create page' };
    }
}

export async function updatePage(id: string, data: FormData) {
    const authResult = await getAuthenticatedUser();
    if ('error' in authResult) return authResult;

    const { user: userData } = authResult;
    const pageResult = await verifyPageOwnership(id, userData.id);
    if ('error' in pageResult) return pageResult;

    try {
        await db.update(pages).set({
            title: data.get('title') as string,
            subtitle: data.get('subtitle') as string,
            avatarUrl: data.get('avatarUrl') as string,
            backgroundImage: data.get('backgroundImage') as string,
            profileColor: data.get('profileColor') as string,
        }).where(eq(pages.id, id));

        return { success: true };
    } catch (error) {
        console.error('Update page error:', error);
        return { error: 'Failed to update page' };
    }
}

export async function deletePage(id: string) {
    const authResult = await getAuthenticatedUser();
    if ('error' in authResult) return authResult;

    const { user: userData } = authResult;
    const pageResult = await verifyPageOwnership(id, userData.id);
    if ('error' in pageResult) return pageResult;

    try {
        await db.delete(pages).where(eq(pages.id, id));
        return { success: true };
    } catch (error) {
        console.error('Delete page error:', error);
        return { error: 'Failed to delete page' };
    }
}

// ============================================================================
// Card Actions
// ============================================================================

type CardInput = Omit<BentoCardProps, 'onEdit' | 'onMove' | 'onArticleClick' | 'isFirst' | 'isLast' | 'className' | 'dragHandleProps' | 'isDragging' | 'customComponent'>;

export async function saveCard(card: CardInput) {
    const authResult = await getAuthenticatedUser();
    if ('error' in authResult) return authResult;

    const { user: userData } = authResult;

    try {
        const existingCardResult = await db.select().from(cards).where(eq(cards.id, card.id)).limit(1);
        const existingCard = existingCardResult[0];

        // Prepare card data
        const cardData = {
            title: card.title,
            subtitle: card.subtitle || null,
            type: card.type,
            url: card.url || null,
            imageUrl: card.imageUrl || null,
            icon: card.icon || null,
            colorClass: card.colorClass,
            customBgColor: card.customBgColor || null,
            customTextColor: card.customTextColor || null,
            size: card.size,
            buttonText: card.buttonText || null,
            githubData: card.githubData ? JSON.stringify(card.githubData) : null,
            contactInfo: card.contactInfo || null,
            mastodonData: card.mastodonData ? JSON.stringify(card.mastodonData) : null,
            articleContent: card.articleContent || null,
            pageId: card.pageId || null,
        };

        if (existingCard) {
            // Verify ownership before updating
            if (existingCard.userId !== userData.id) {
                return { error: 'Forbidden: You do not own this card' };
            }

            // If pageId is provided, verify ownership of the page
            if (card.pageId) {
                const pageResult = await verifyPageOwnership(card.pageId, userData.id);
                if ('error' in pageResult) return pageResult;
            }

            await db.update(cards).set(cardData).where(eq(cards.id, card.id));
        } else {
            // New card - calculate order
            let newOrder = 0;

            if (card.pageId) {
                const pageResult = await verifyPageOwnership(card.pageId, userData.id);
                if ('error' in pageResult) return pageResult;

                const lastCard = await db.select().from(cards).where(eq(cards.pageId, card.pageId)).orderBy(asc(cards.order));
                newOrder = lastCard.length > 0 ? (lastCard[lastCard.length - 1].order || 0) + 1 : 0;
            } else {
                const lastCard = await db.select().from(cards).where(
                    and(eq(cards.userId, userData.id), sql`${cards.pageId} IS NULL`)
                ).orderBy(asc(cards.order));
                newOrder = lastCard.length > 0 ? (lastCard[lastCard.length - 1].order || 0) + 1 : 0;
            }

            await db.insert(cards).values({
                id: card.id,
                userId: userData.id,
                order: newOrder,
                ...cardData,
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Save card error:', error);
        return { error: 'Failed to save card' };
    }
}

export async function deleteCard(id: string) {
    const authResult = await getAuthenticatedUser();
    if ('error' in authResult) return authResult;

    const { user: userData } = authResult;
    const cardResult = await verifyCardOwnership(id, userData.id);
    if ('error' in cardResult) return cardResult;

    try {
        await db.delete(cards).where(eq(cards.id, id));
        return { success: true };
    } catch (error) {
        console.error('Delete card error:', error);
        return { error: 'Failed to delete card' };
    }
}

export async function reorderCards(items: { id: string; order: number }[]) {
    const authResult = await getAuthenticatedUser();
    if ('error' in authResult) return authResult;

    const { user: userData } = authResult;

    try {
        // Verify all cards belong to the user
        const userCards = await db.select({ id: cards.id }).from(cards).where(eq(cards.userId, userData.id));
        const userCardIds = new Set(userCards.map(c => c.id));

        for (const item of items) {
            if (!userCardIds.has(item.id)) {
                return { error: 'Forbidden: One or more cards do not belong to you' };
            }
        }

        await db.transaction(async (tx) => {
            for (const item of items) {
                await tx.update(cards).set({ order: item.order }).where(eq(cards.id, item.id));
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Reorder cards error:', error);
        return { error: 'Failed to reorder cards' };
    }
}

// ============================================================================
// Analytics Actions
// ============================================================================

export async function trackCardClick(cardId: string, userAgent?: string, referer?: string) {
    try {
        await db.update(cards).set({ clicks: sql`${cards.clicks} + 1` }).where(eq(cards.id, cardId));
        await db.insert(cardClicks).values({
            cardId,
            userAgent: userAgent || null,
            referer: referer || null,
        });
        return { success: true };
    } catch (error) {
        console.error('Track click error:', error);
        return { error: 'Failed to track click' };
    }
}

export async function getCardStats(userId: string) {
    const authResult = await getAuthenticatedUser();
    if ('error' in authResult) return authResult;

    const { user: userData } = authResult;

    if (userData.id !== userId) {
        return { error: 'Unauthorized' };
    }

    try {
        const userCards = await db.select({ id: cards.id, title: cards.title, clicks: cards.clicks })
            .from(cards).where(eq(cards.userId, userId));

        const stats = userCards.map(card => ({
            id: card.id,
            title: card.title,
            clicks: card.clicks || 0,
        }));

        const totalClicks = stats.reduce((sum, card) => sum + card.clicks, 0);

        return { stats, totalClicks };
    } catch (error) {
        console.error('Get stats error:', error);
        return { error: 'Failed to get stats' };
    }
}
