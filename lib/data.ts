import { db } from '@/lib/db';
import { users, cards } from '@/lib/schema';
import { eq, asc, sql } from 'drizzle-orm';
import { UserProfile, BentoCardProps, CardSize, CardType } from '@/lib/types';

export async function getUserProfile(username: string) {
    // Select only needed user fields for better performance
    const userResult = await db.select({
        id: users.id,
        name: users.name,
        username: users.username,
        bio: users.bio,
        image: users.image,
        backgroundImage: users.backgroundImage,
        profileColor: users.profileColor,
    }).from(users).where(eq(users.username, username)).limit(1);
    
    const user = userResult[0];

    if (!user) return null;

    // Fetch cards with index on userId and order for better performance
    const userCards = await db.select().from(cards).where(eq(cards.userId, user.id)).orderBy(asc(cards.order));

    const profile: UserProfile = {
        name: user.name || user.username,
        bio: user.bio || '',
        avatarUrl: user.image || `https://i.sevencdn.com/avatar/${user.username}`,
        backgroundImage: user.backgroundImage || undefined,
        profileColor: user.profileColor || undefined,
    };

    const mappedCards: BentoCardProps[] = userCards.map(c => ({
        id: c.id,
        title: c.title,
        subtitle: c.subtitle || undefined,
        type: c.type as CardType,
        url: c.url || undefined,
        icon: c.icon || undefined,
        colorClass: c.colorClass || 'bg-gray-100',
        size: c.size as CardSize,
        buttonText: c.buttonText || undefined,
        imageUrl: c.url && (c.type === 'image' || c.type === 'image-link') ? c.url : undefined,
        githubData: c.githubData ? JSON.parse(c.githubData) : undefined,
        contactInfo: c.contactInfo || undefined,
        mastodonData: c.mastodonData ? JSON.parse(c.mastodonData) : undefined,
    }));

    return { profile, cards: mappedCards, user };
}

export async function getHomepageCards() {
    const isCommunityMode = process.env.COMMUNITY_MODE === 'true';
    
    if (isCommunityMode) {
        // Community mode: show admin user's page
        const adminResult = await db.select({
            username: users.username,
        }).from(users).where(eq(users.role, 'admin')).limit(1);
        
        const admin = adminResult[0];
        if (!admin) return null;
        
        return getUserProfile(admin.username);
    } else {
        // Single user mode: show first user's page
        const firstUserResult = await db.select({
            username: users.username,
        }).from(users).orderBy(asc(users.createdAt)).limit(1);
        
        const firstUser = firstUserResult[0];
        if (!firstUser) return null;
        
        return getUserProfile(firstUser.username);
    }
}

export async function getFirstUser() {
    const firstUserResult = await db.select({
        id: users.id,
        username: users.username,
        name: users.name,
    }).from(users).orderBy(asc(users.createdAt)).limit(1);
    
    return firstUserResult[0] || null;
}

export async function isRegistrationOpen() {
    const isCommunityMode = process.env.COMMUNITY_MODE === 'true';
    
    if (isCommunityMode) {
        // Community mode: registration always open
        return true;
    }
    
    // Single user mode: check if any user exists
    const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
    return userCount[0].count === 0;
}
