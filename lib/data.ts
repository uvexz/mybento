import { db } from '@/lib/db';
import { user, cards, pages } from '@/lib/schema';
import { eq, asc, sql, and } from 'drizzle-orm';
import { UserProfile, BentoCardProps, CardSize, CardType } from '@/lib/types';

// ============================================================================
// Helper Functions
// ============================================================================

function mapCardToProps(card: typeof cards.$inferSelect): BentoCardProps {
    return {
        id: card.id,
        title: card.title,
        subtitle: card.subtitle || undefined,
        type: card.type as CardType,
        url: card.url || undefined,
        icon: card.icon || undefined,
        colorClass: card.customBgColor ? 'custom-color' : (card.colorClass || 'custom-color'),
        customBgColor: card.customBgColor || undefined,
        customTextColor: card.customTextColor || undefined,
        size: card.size as CardSize,
        buttonText: card.buttonText || undefined,
        imageUrl: card.imageUrl || undefined,
        githubData: card.githubData ? JSON.parse(card.githubData) : undefined,
        contactInfo: card.contactInfo || undefined,
        mastodonData: card.mastodonData ? JSON.parse(card.mastodonData) : undefined,
        articleContent: card.articleContent || undefined,
    };
}

// ============================================================================
// User Profile Functions
// ============================================================================

export async function getUserProfile(username: string) {
    const userResult = await db.select({
        id: user.id,
        name: user.name,
        username: user.username,
        bio: user.bio,
        image: user.image,
        backgroundImage: user.backgroundImage,
        profileColor: user.profileColor,
        role: user.role,
    }).from(user).where(eq(user.username, username)).limit(1);

    const userData = userResult[0];
    if (!userData) return null;

    // Fetch cards and pages in parallel
    const [userCards, userPages] = await Promise.all([
        db.select().from(cards).where(
            and(eq(cards.userId, userData.id), sql`${cards.pageId} IS NULL`)
        ).orderBy(asc(cards.order)),
        db.select().from(pages).where(eq(pages.userId, userData.id)).orderBy(asc(pages.createdAt)),
    ]);

    const profile: UserProfile = {
        name: userData.name || userData.username,
        bio: userData.bio || '',
        avatarUrl: userData.image || `https://i.sevencdn.com/avatar/${userData.username}`,
        backgroundImage: userData.backgroundImage || undefined,
        profileColor: userData.profileColor || undefined,
    };

    return {
        profile,
        cards: userCards.map(mapCardToProps),
        user: userData,
        pages: userPages,
    };
}

export async function getUserPages(username: string) {
    const userResult = await db.select({ id: user.id }).from(user).where(eq(user.username, username)).limit(1);
    if (!userResult[0]) return [];

    return db.select().from(pages).where(eq(pages.userId, userResult[0].id)).orderBy(asc(pages.createdAt));
}

export async function getPageProfile(username: string, pageSlug: string) {
    const userResult = await db.select({
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
    }).from(user).where(eq(user.username, username)).limit(1);

    const userData = userResult[0];
    if (!userData) return null;

    const pageResult = await db.select().from(pages).where(
        and(eq(pages.userId, userData.id), eq(pages.slug, pageSlug))
    ).limit(1);

    const pageData = pageResult[0];
    if (!pageData) return null;

    const pageCards = await db.select().from(cards).where(eq(cards.pageId, pageData.id)).orderBy(asc(cards.order));

    const profile: UserProfile = {
        name: pageData.title,
        bio: pageData.subtitle || '',
        avatarUrl: pageData.avatarUrl || `https://i.sevencdn.com/avatar/${pageSlug}`,
        backgroundImage: pageData.backgroundImage || undefined,
        profileColor: pageData.profileColor || undefined,
    };

    return {
        profile,
        cards: pageCards.map(mapCardToProps),
        user: userData,
        page: pageData,
    };
}

// ============================================================================
// Homepage & Registration Functions
// ============================================================================

export async function getHomepageCards() {
    const firstUserResult = await db.select({ username: user.username })
        .from(user).orderBy(asc(user.createdAt)).limit(1);

    const firstUser = firstUserResult[0];
    if (!firstUser) return null;

    return getUserProfile(firstUser.username);
}

export async function getFirstUser() {
    const firstUserResult = await db.select({
        id: user.id,
        username: user.username,
        name: user.name,
    }).from(user).orderBy(asc(user.createdAt)).limit(1);

    return firstUserResult[0] || null;
}

export async function isRegistrationOpen() {
    if (process.env.COMMUNITY_MODE === 'true') {
        return true;
    }

    try {
        const userCount = await db.select({ count: sql<number>`count(*)` }).from(user);
        return Number(userCount[0]?.count || 0) === 0;
    } catch (error) {
        console.error('Error checking registration status:', error);
        return true;
    }
}
