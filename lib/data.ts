import { db } from '@/lib/db';
import { users, cards } from '@/lib/schema';
import { eq, asc } from 'drizzle-orm';
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
    // Find the first admin user - only select username for efficiency
    const adminResult = await db.select({
        username: users.username,
    }).from(users).where(eq(users.role, 'admin')).limit(1);
    
    const admin = adminResult[0];

    if (!admin) return null;

    return getUserProfile(admin.username);
}
