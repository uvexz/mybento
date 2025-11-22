'use server';

import { db } from './db';
import { siteSettings, userPermissions, user, cards, shortLinks } from './schema';
import { eq, count } from 'drizzle-orm';
import { auth } from './auth';
import { headers } from 'next/headers';

// Check if user is admin
export async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        return false;
    }

    const userRecord = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
    return userRecord[0]?.role === 'admin';
}

// Get site settings
export async function getSiteSettings() {
    if (!await isAdmin()) {
        throw new Error('Unauthorized');
    }

    const settings = await db.select().from(siteSettings);
    const settingsMap: Record<string, string> = {};
    
    settings.forEach(setting => {
        settingsMap[setting.key] = setting.value || '';
    });

    // Return with defaults
    return {
        siteName: settingsMap.site_name || process.env.NEXT_PUBLIC_SITE_NAME || 'mybento',
        siteDescription: settingsMap.site_description || process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '',
        communityMode: settingsMap.community_mode === 'true',
        r2Endpoint: settingsMap.r2_endpoint || process.env.R2_ENDPOINT || '',
        r2AccessKeyId: settingsMap.r2_access_key_id || process.env.R2_ACCESS_KEY_ID || '',
        r2SecretAccessKey: settingsMap.r2_secret_access_key ? '********' : '',
        r2BucketName: settingsMap.r2_bucket_name || process.env.R2_BUCKET_NAME || '',
        r2PublicUrl: settingsMap.r2_public_url || process.env.R2_PUBLIC_URL || '',
        maxUploadSize: parseInt(settingsMap.max_upload_size || '5'),
        resendApiKey: settingsMap.resend_api_key ? '********' : '',
        emailFrom: settingsMap.email_from || process.env.EMAIL_FROM || '',
    };
}

// Update site settings
export async function updateSiteSettings(settings: {
    siteName?: string;
    siteDescription?: string;
    communityMode?: boolean;
    r2Endpoint?: string;
    r2AccessKeyId?: string;
    r2SecretAccessKey?: string;
    r2BucketName?: string;
    r2PublicUrl?: string;
    maxUploadSize?: number;
    resendApiKey?: string;
    emailFrom?: string;
}) {
    if (!await isAdmin()) {
        throw new Error('Unauthorized');
    }

    const updates: Array<{ key: string; value: string }> = [];

    if (settings.siteName !== undefined) {
        updates.push({ key: 'site_name', value: settings.siteName });
    }
    if (settings.siteDescription !== undefined) {
        updates.push({ key: 'site_description', value: settings.siteDescription });
    }
    if (settings.communityMode !== undefined) {
        updates.push({ key: 'community_mode', value: settings.communityMode.toString() });
    }
    if (settings.r2Endpoint !== undefined) {
        updates.push({ key: 'r2_endpoint', value: settings.r2Endpoint });
    }
    if (settings.r2AccessKeyId !== undefined) {
        updates.push({ key: 'r2_access_key_id', value: settings.r2AccessKeyId });
    }
    if (settings.r2SecretAccessKey !== undefined && settings.r2SecretAccessKey !== '********') {
        updates.push({ key: 'r2_secret_access_key', value: settings.r2SecretAccessKey });
    }
    if (settings.r2BucketName !== undefined) {
        updates.push({ key: 'r2_bucket_name', value: settings.r2BucketName });
    }
    if (settings.r2PublicUrl !== undefined) {
        updates.push({ key: 'r2_public_url', value: settings.r2PublicUrl });
    }
    if (settings.maxUploadSize !== undefined) {
        updates.push({ key: 'max_upload_size', value: settings.maxUploadSize.toString() });
    }
    if (settings.resendApiKey !== undefined && settings.resendApiKey !== '********') {
        updates.push({ key: 'resend_api_key', value: settings.resendApiKey });
    }
    if (settings.emailFrom !== undefined) {
        updates.push({ key: 'email_from', value: settings.emailFrom });
    }

    // Upsert settings
    for (const update of updates) {
        const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, update.key)).limit(1);
        
        if (existing.length > 0) {
            await db.update(siteSettings)
                .set({ value: update.value, updatedAt: new Date() })
                .where(eq(siteSettings.key, update.key));
        } else {
            await db.insert(siteSettings).values({
                key: update.key,
                value: update.value,
            });
        }
    }

    return { success: true };
}

// Get default user permissions
export async function getDefaultUserPermissions() {
    if (!await isAdmin()) {
        throw new Error('Unauthorized');
    }

    const settings = await db.select().from(siteSettings).where(eq(siteSettings.key, 'default_user_permissions')).limit(1);
    
    if (settings.length > 0 && settings[0].value) {
        return JSON.parse(settings[0].value);
    }

    return {
        canUploadImages: true,
        maxImages: 50,
        maxShortLinks: 100,
        maxCards: 50,
    };
}

// Update default user permissions
export async function updateDefaultUserPermissions(permissions: {
    canUploadImages: boolean;
    maxImages: number;
    maxShortLinks: number;
    maxCards: number;
}) {
    if (!await isAdmin()) {
        throw new Error('Unauthorized');
    }

    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, 'default_user_permissions')).limit(1);
    
    if (existing.length > 0) {
        await db.update(siteSettings)
            .set({ value: JSON.stringify(permissions), updatedAt: new Date() })
            .where(eq(siteSettings.key, 'default_user_permissions'));
    } else {
        await db.insert(siteSettings).values({
            key: 'default_user_permissions',
            value: JSON.stringify(permissions),
        });
    }

    return { success: true };
}

// Get user permissions
export async function getUserPermissions(userId: string) {
    const permissions = await db.select().from(userPermissions).where(eq(userPermissions.userId, userId)).limit(1);
    
    if (permissions.length > 0) {
        return permissions[0];
    }

    // Return default permissions
    const defaultPerms = await getDefaultUserPermissions();
    return {
        userId,
        canUploadImages: defaultPerms.canUploadImages,
        maxImages: defaultPerms.maxImages,
        maxShortLinks: defaultPerms.maxShortLinks,
        maxCards: defaultPerms.maxCards,
    };
}

// Check if user can perform action
export async function canUserPerformAction(userId: string, action: 'upload' | 'create_card' | 'create_short_link'): Promise<{ allowed: boolean; reason?: string }> {
    const permissions = await getUserPermissions(userId);

    if (action === 'upload') {
        if (!permissions.canUploadImages) {
            return { allowed: false, reason: 'Image upload is disabled for your account' };
        }
        // Check current image count (this is a simplified check)
        return { allowed: true };
    }

    if (action === 'create_card') {
        const cardCount = await db.select({ count: count() }).from(cards).where(eq(cards.userId, userId));
        if (cardCount[0].count >= permissions.maxCards) {
            return { allowed: false, reason: `Maximum cards limit reached (${permissions.maxCards})` };
        }
        return { allowed: true };
    }

    if (action === 'create_short_link') {
        const linkCount = await db.select({ count: count() }).from(shortLinks).where(eq(shortLinks.userId, userId));
        if (linkCount[0].count >= permissions.maxShortLinks) {
            return { allowed: false, reason: `Maximum short links limit reached (${permissions.maxShortLinks})` };
        }
        return { allowed: true };
    }

    return { allowed: false, reason: 'Unknown action' };
}

// Get admin statistics
export async function getAdminStats() {
    if (!await isAdmin()) {
        throw new Error('Unauthorized');
    }

    const [userCount, cardCount, shortLinkCount] = await Promise.all([
        db.select({ count: count() }).from(user),
        db.select({ count: count() }).from(cards),
        db.select({ count: count() }).from(shortLinks),
    ]);

    return {
        totalUsers: userCount[0].count,
        totalCards: cardCount[0].count,
        totalShortLinks: shortLinkCount[0].count,
    };
}
