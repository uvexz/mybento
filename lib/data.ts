import { db } from '@/lib/db';
import { user, cards, pages } from '@/lib/schema';
import { eq, asc, sql, and } from 'drizzle-orm';
import { UserProfile, BentoCardProps, CardSize, CardType } from '@/lib/types';

export async function getUserProfile(username: string) {
    // Select only needed user fields for better performance
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

    // Fetch cards with index on userId and order for better performance
    const userCards = await db.select().from(cards).where(
        and(
            eq(cards.userId, userData.id),
            sql`${cards.pageId} IS NULL`
        )
    ).orderBy(asc(cards.order));

    // Fetch user pages
    const userPages = await db.select().from(pages).where(eq(pages.userId, userData.id)).orderBy(asc(pages.createdAt));

    const profile: UserProfile = {
        name: userData.name || userData.username,
        bio: userData.bio || '',
        avatarUrl: userData.image || `https://i.sevencdn.com/avatar/${userData.username}`,
        backgroundImage: userData.backgroundImage || undefined,
        profileColor: userData.profileColor || undefined,
    };

    const mappedCards: BentoCardProps[] = userCards.map(c => ({
        id: c.id,
        title: c.title,
        subtitle: c.subtitle || undefined,
        type: c.type as CardType,
        url: c.url || undefined,
        icon: c.icon || undefined,
        colorClass: c.customBgColor ? 'custom-color' : (c.colorClass || 'custom-color'),
        customBgColor: c.customBgColor || undefined,
        customTextColor: c.customTextColor || undefined,
        size: c.size as CardSize,
        buttonText: c.buttonText || undefined,
        imageUrl: c.imageUrl || undefined,
        githubData: c.githubData ? JSON.parse(c.githubData) : undefined,
        contactInfo: c.contactInfo || undefined,
        mastodonData: c.mastodonData ? JSON.parse(c.mastodonData) : undefined,
        articleContent: c.articleContent || undefined,
        clicks: c.clicks || 0,
    }));

    // Return only serializable data (no Drizzle relations)
    return {
        profile,
        cards: mappedCards,
        user: {
            id: userData.id,
            name: userData.name,
            username: userData.username,
            bio: userData.bio,
            image: userData.image,
            backgroundImage: userData.backgroundImage,
            profileColor: userData.profileColor,
            role: userData.role,
        },
        pages: userPages
    };
}

export async function getUserPages(username: string) {
    const userResult = await db.select({ id: user.id }).from(user).where(eq(user.username, username)).limit(1);
    const userData = userResult[0];
    if (!userData) return [];

    return await db.select().from(pages).where(eq(pages.userId, userData.id)).orderBy(asc(pages.createdAt));
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
        and(
            eq(pages.userId, userData.id),
            eq(pages.slug, pageSlug)
        )
    ).limit(1);

    const pageData = pageResult[0];
    if (!pageData) return null;

    // Fetch cards for this page
    const pageCards = await db.select().from(cards).where(eq(cards.pageId, pageData.id)).orderBy(asc(cards.order));

    const profile: UserProfile = {
        name: pageData.title,
        bio: pageData.subtitle || '',
        avatarUrl: pageData.avatarUrl || `https://i.sevencdn.com/avatar/${pageSlug}`, // Fallback
        backgroundImage: pageData.backgroundImage || undefined,
        profileColor: pageData.profileColor || undefined,
    };

    const mappedCards: BentoCardProps[] = pageCards.map(c => ({
        id: c.id,
        title: c.title,
        subtitle: c.subtitle || undefined,
        type: c.type as CardType,
        url: c.url || undefined,
        icon: c.icon || undefined,
        colorClass: c.customBgColor ? 'custom-color' : (c.colorClass || 'custom-color'),
        customBgColor: c.customBgColor || undefined,
        customTextColor: c.customTextColor || undefined,
        size: c.size as CardSize,
        buttonText: c.buttonText || undefined,
        imageUrl: c.imageUrl || undefined,
        githubData: c.githubData ? JSON.parse(c.githubData) : undefined,
        contactInfo: c.contactInfo || undefined,
        mastodonData: c.mastodonData ? JSON.parse(c.mastodonData) : undefined,
        articleContent: c.articleContent || undefined,
        clicks: c.clicks || 0,
    }));

    return {
        profile,
        cards: mappedCards,
        user: userData,
        page: pageData
    };
}

export async function getHomepageCards() {
    // Always show the first registered user's page on homepage
    // In single user mode: homepage redirects to their page directly
    // In community mode: homepage shows landing page with their cards as preview
    const firstUserResult = await db.select({
        username: user.username,
    }).from(user).orderBy(asc(user.createdAt)).limit(1);

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
    const isCommunityMode = process.env.COMMUNITY_MODE === 'true';

    if (isCommunityMode) {
        // Community mode: registration always open
        return true;
    }

    // Single user mode: check if any user exists in Better Auth's user table
    try {
        const userCount = await db.select({ count: sql<number>`count(*)` }).from(user);
        const count = Number(userCount[0]?.count || 0);
        return count === 0;
    } catch (error) {
        console.error('Error checking registration status:', error);
        // 如果查询失败，默认允许注册
        return true;
    }
}
