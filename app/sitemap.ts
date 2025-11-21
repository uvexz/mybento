import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    let userPages: MetadataRoute.Sitemap = [];

    try {
        // Get all users
        const allUsers = await db.select({ username: users.username, createdAt: users.createdAt }).from(users);

        userPages = allUsers.map((user) => ({
            url: `${siteUrl}/${user.username}`,
            lastModified: user.createdAt || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));
    } catch (error) {
        console.error('Failed to fetch users for sitemap:', error);
        // Return basic sitemap if database is not ready
    }

    return [
        {
            url: siteUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${siteUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${siteUrl}/register`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...userPages,
    ];
}
