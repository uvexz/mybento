import { db } from '@/lib/db';
import { users, cards } from '@/lib/schema';
import { eq, asc } from 'drizzle-orm';
import { UserProfile, BentoCardProps, CardSize, CardType } from '@/lib/types';

export async function getUserProfile(username: string) {
    const userResult = await db.select().from(users).where(eq(users.username, username)).limit(1);
    const user = userResult[0];

    if (!user) return null;

    const userCards = await db.select().from(cards).where(eq(cards.userId, user.id)).orderBy(asc(cards.order));

    const profile: UserProfile = {
        name: user.name || user.username,
        bio: user.bio || '',
        avatarUrl: user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
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
        buttonText: 'Visit', // Default, maybe store in DB if needed
        imageUrl: c.url && (c.type === 'image' || c.type === 'image-link') ? c.url : undefined, // Assuming url stores image url for image types
    }));

    return { profile, cards: mappedCards, user };
}

export async function getHomepageCards() {
    // Find the first admin user
    const adminResult = await db.select().from(users).where(eq(users.role, 'admin')).limit(1);
    const admin = adminResult[0];

    if (!admin) return null;

    return getUserProfile(admin.username);
}
