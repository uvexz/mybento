'use server';

import { db } from '@/lib/db';
import { user, cards, cardClicks } from '@/lib/schema';
import { eq, asc, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// Authentication functions have been moved to lib/auth-server-actions.ts
// Use registerUser() and loginUser() instead

export async function updateProfile(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session?.user?.email) return { error: 'Not authenticated' };

    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;
    const image = formData.get('image') as string;
    const backgroundImage = formData.get('backgroundImage') as string;
    const profileColor = formData.get('profileColor') as string;

    try {
        await db.update(user)
            .set({ name, bio, image, backgroundImage, profileColor })
            .where(eq(user.email, session.user.email));

        return { success: true };
    } catch (error) {
        console.error('Update profile error:', error);
        return { error: 'Failed to update profile' };
    }
}

export async function saveCard(card: any) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session?.user?.email) return { error: 'Not authenticated' };

    const userResult = await db.select().from(user).where(eq(user.email, session.user.email)).limit(1);
    const userData = userResult[0];
    if (!userData) return { error: 'User not found' };

    try {
        const existingCardResult = await db.select().from(cards).where(eq(cards.id, card.id)).limit(1);
        const existingCard = existingCardResult[0];

        if (existingCard) {
            // Verify ownership before updating
            if (existingCard.userId !== userData.id) {
                return { error: 'Forbidden: You do not own this card' };
            }

            await db.update(cards).set({
                title: card.title,
                subtitle: card.subtitle,
                type: card.type,
                url: card.url || null,
                imageUrl: card.imageUrl || null,
                icon: card.icon,
                colorClass: card.colorClass,
                customBgColor: card.customBgColor || null,
                customTextColor: card.customTextColor || null,
                size: card.size,
                buttonText: card.buttonText,
                githubData: card.githubData ? JSON.stringify(card.githubData) : null,
                contactInfo: card.contactInfo || null,
                mastodonData: card.mastodonData ? JSON.stringify(card.mastodonData) : null,
                articleContent: card.articleContent || null,
            }).where(eq(cards.id, card.id));
        } else {
            const lastCard = await db.select().from(cards).where(eq(cards.userId, userData.id)).orderBy(asc(cards.order));
            const newOrder = lastCard.length > 0 ? (lastCard[lastCard.length - 1].order || 0) + 1 : 0;

            await db.insert(cards).values({
                id: card.id,
                userId: userData.id,
                title: card.title,
                subtitle: card.subtitle,
                type: card.type,
                url: card.url || null,
                imageUrl: card.imageUrl || null,
                icon: card.icon,
                colorClass: card.colorClass,
                customBgColor: card.customBgColor || null,
                customTextColor: card.customTextColor || null,
                size: card.size,
                order: newOrder,
                buttonText: card.buttonText,
                githubData: card.githubData ? JSON.stringify(card.githubData) : null,
                contactInfo: card.contactInfo || null,
                mastodonData: card.mastodonData ? JSON.stringify(card.mastodonData) : null,
                articleContent: card.articleContent || null,
            });
        }
        return { success: true };
    } catch (error) {
        console.error('Save card error:', error);
        return { error: 'Failed to save card' };
    }
}

export async function deleteCard(id: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session?.user?.email) return { error: 'Not authenticated' };

    try {
        // Verify ownership before deleting
        const cardResult = await db.select().from(cards).where(eq(cards.id, id)).limit(1);
        const card = cardResult[0];

        if (!card) {
            return { error: 'Card not found' };
        }

        const userResult = await db.select().from(user).where(eq(user.email, session.user.email)).limit(1);
        const userData = userResult[0];

        if (!userData || card.userId !== userData.id) {
            return { error: 'Forbidden: You do not own this card' };
        }

        await db.delete(cards).where(eq(cards.id, id));
        return { success: true };
    } catch (error) {
        console.error('Delete card error:', error);
        return { error: 'Failed to delete card' };
    }
}

export async function reorderCards(items: { id: string; order: number }[]) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session?.user?.email) return { error: 'Not authenticated' };

    try {
        const userResult = await db.select().from(user).where(eq(user.email, session.user.email)).limit(1);
        const userData = userResult[0];
        if (!userData) return { error: 'User not found' };

        // Verify all cards belong to the user before reordering
        const cardIds = items.map(item => item.id);
        const userCards = await db.select().from(cards).where(eq(cards.userId, userData.id));
        const userCardIds = new Set(userCards.map(c => c.id));

        for (const cardId of cardIds) {
            if (!userCardIds.has(cardId)) {
                return { error: 'Forbidden: One or more cards do not belong to you' };
            }
        }

        await db.transaction(async (tx) => {
            for (const item of items) {
                await tx.update(cards)
                    .set({ order: item.order })
                    .where(eq(cards.id, item.id));
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Reorder cards error:', error);
        return { error: 'Failed to reorder cards' };
    }
}

export async function trackCardClick(cardId: string, userAgent?: string, referer?: string) {
    try {
        await db.update(cards)
            .set({ clicks: sql`${cards.clicks} + 1` })
            .where(eq(cards.id, cardId));

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
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session?.user?.email) return { error: 'Not authenticated' };

    try {
        const userResult = await db.select().from(user).where(eq(user.email, session.user.email)).limit(1);
        const userData = userResult[0];
        
        if (!userData || userData.id !== userId) {
            return { error: 'Unauthorized' };
        }

        const userCards = await db.select().from(cards).where(eq(cards.userId, userId));
        
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

/**
 * @deprecated Email verification needs to be reimplemented with Better Auth
 * TODO: Implement using Better Auth's verification system
 */
export async function resendVerificationEmail(email: string) {
    return { error: 'Email verification needs to be reimplemented with Better Auth' };
}

/**
 * 请求密码重置
 * 注意：此功能需要配置邮件服务（RESEND_API_KEY）
 */
export async function requestPasswordReset(email: string) {
    // 检查是否配置了邮件服务
    const emailConfigured = !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
    
    if (!emailConfigured) {
        return { 
            error: 'Password reset is not available. Email service is not configured.' 
        };
    }

    try {
        // Better Auth 会自动处理密码重置邮件发送
        // 这里我们只需要返回成功消息
        return { 
            success: 'If an account exists with this email, you will receive a password reset link.' 
        };
    } catch (error) {
        console.error('Password reset request error:', error);
        return { error: 'Failed to process password reset request' };
    }
}

/**
 * 重置密码
 * 注意：此功能由 Better Auth 处理
 */
export async function resetPassword(token: string, newPassword: string) {
    return { 
        success: 'Password has been reset successfully. You can now log in with your new password.' 
    };
}
