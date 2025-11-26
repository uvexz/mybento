'use server';

import { db } from './db';
import { siteSettings, userPermissions, user, cards, shortLinks } from './schema';
import { eq, count } from 'drizzle-orm';
import { auth } from './auth';
import { headers } from 'next/headers';

// ============================================================================
// Auth Helpers
// ============================================================================

async function getAdminUser() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return null;

    const userRecord = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
    return userRecord[0]?.role === 'admin' ? userRecord[0] : null;
}

export async function isAdmin(): Promise<boolean> {
    return (await getAdminUser()) !== null;
}

async function requireAdmin() {
    const admin = await getAdminUser();
    if (!admin) throw new Error('Unauthorized');
    return admin;
}

// ============================================================================
// Site Settings
// ============================================================================

export async function getSiteSettings() {
    await requireAdmin();
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

type SiteSettingsInput = {
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
};

const SETTINGS_MAP: Record<keyof SiteSettingsInput, string> = {
    siteName: 'site_name',
    siteDescription: 'site_description',
    communityMode: 'community_mode',
    r2Endpoint: 'r2_endpoint',
    r2AccessKeyId: 'r2_access_key_id',
    r2SecretAccessKey: 'r2_secret_access_key',
    r2BucketName: 'r2_bucket_name',
    r2PublicUrl: 'r2_public_url',
    maxUploadSize: 'max_upload_size',
    resendApiKey: 'resend_api_key',
    emailFrom: 'email_from',
};

async function upsertSetting(key: string, value: string) {
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
    if (existing.length > 0) {
        await db.update(siteSettings).set({ value, updatedAt: new Date() }).where(eq(siteSettings.key, key));
    } else {
        await db.insert(siteSettings).values({ key, value });
    }
}

export async function updateSiteSettings(settings: SiteSettingsInput) {
    await requireAdmin();

    for (const [key, dbKey] of Object.entries(SETTINGS_MAP)) {
        const value = settings[key as keyof SiteSettingsInput];
        if (value === undefined) continue;
        
        // Skip masked password fields
        if ((key === 'r2SecretAccessKey' || key === 'resendApiKey') && value === '********') continue;
        
        const strValue = typeof value === 'boolean' ? value.toString() : String(value);
        await upsertSetting(dbKey, strValue);
    }

    return { success: true };
}

// ============================================================================
// User Permissions
// ============================================================================

const DEFAULT_PERMISSIONS = {
    canUploadImages: true,
    maxImages: 50,
    maxShortLinks: 100,
    maxCards: 50,
    maxPages: 3,
};

export async function getDefaultUserPermissions() {
    await requireAdmin();
    const settings = await db.select().from(siteSettings).where(eq(siteSettings.key, 'default_user_permissions')).limit(1);
    return settings[0]?.value ? JSON.parse(settings[0].value) : DEFAULT_PERMISSIONS;
}

export async function updateDefaultUserPermissions(permissions: typeof DEFAULT_PERMISSIONS) {
    await requireAdmin();
    await upsertSetting('default_user_permissions', JSON.stringify(permissions));
    return { success: true };
}

export async function getUserPermissions(userId: string) {
    const permissions = await db.select().from(userPermissions).where(eq(userPermissions.userId, userId)).limit(1);
    if (permissions[0]) return permissions[0];

    // Return default permissions (no admin check needed for reading own permissions)
    const settings = await db.select().from(siteSettings).where(eq(siteSettings.key, 'default_user_permissions')).limit(1);
    const defaultPerms = settings[0]?.value ? JSON.parse(settings[0].value) : DEFAULT_PERMISSIONS;
    
    return { userId, ...defaultPerms };
}

type ActionType = 'upload' | 'create_card' | 'create_short_link';

export async function canUserPerformAction(userId: string, action: ActionType): Promise<{ allowed: boolean; reason?: string }> {
    const permissions = await getUserPermissions(userId);

    if (action === 'upload') {
        return permissions.canUploadImages 
            ? { allowed: true } 
            : { allowed: false, reason: 'Image upload is disabled for your account' };
    }

    if (action === 'create_card') {
        const cardCount = await db.select({ count: count() }).from(cards).where(eq(cards.userId, userId));
        return cardCount[0].count >= permissions.maxCards
            ? { allowed: false, reason: `Maximum cards limit reached (${permissions.maxCards})` }
            : { allowed: true };
    }

    if (action === 'create_short_link') {
        const linkCount = await db.select({ count: count() }).from(shortLinks).where(eq(shortLinks.userId, userId));
        return linkCount[0].count >= permissions.maxShortLinks
            ? { allowed: false, reason: `Maximum short links limit reached (${permissions.maxShortLinks})` }
            : { allowed: true };
    }

    return { allowed: false, reason: 'Unknown action' };
}

// ============================================================================
// Admin Statistics
// ============================================================================

export async function getAdminStats() {
    await requireAdmin();

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
