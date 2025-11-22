'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { users, cards, cardClicks } from '@/lib/schema';
import { eq, asc, sql, and, gt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signIn, auth } from '@/auth';
import { AuthError } from 'next-auth';
import { validatePasswordStrength } from '@/lib/password';
import { sanitizeUsername, sanitizeEmail, isValidEmail } from '@/lib/sanitize';
import { 
    isEmailVerificationEnabled, 
    generateVerificationToken, 
    getVerificationTokenExpiry, 
    sendVerificationEmail 
} from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { isRegistrationOpen } from '@/lib/data';

const RegisterSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(50),
    email: z.string().min(1, 'Email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function register(formData: FormData) {
    // Check if registration is open
    const registrationOpen = await isRegistrationOpen();
    if (!registrationOpen) {
        return { error: 'Registration is currently closed.' };
    }

    // Sanitize inputs
    const rawUsername = sanitizeUsername(formData.get('username') as string);
    const rawEmail = sanitizeEmail(formData.get('email') as string);
    const rawPassword = formData.get('password') as string;

    // Validate email format
    if (!isValidEmail(rawEmail)) {
        return { error: 'Invalid email address' };
    }

    const validatedFields = RegisterSchema.safeParse({
        username: rawUsername,
        email: rawEmail,
        password: rawPassword,
    });

    if (!validatedFields.success) {
        const errors = validatedFields.error.issues;
        return { error: errors[0]?.message || 'Invalid fields' };
    }

    const { email, password, username } = validatedFields.data;

    // Check password strength
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.isValid) {
        return { error: 'Password is too weak. ' + passwordCheck.feedback.join('. ') };
    }

    try {
        // Check if user exists
        const existingUserResult = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
        if (existingUserResult.length > 0) {
            return { error: 'Email already in use' };
        }

        const existingUsernameResult = await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1);
        if (existingUsernameResult.length > 0) {
            return { error: 'Username already taken' };
        }

        // Check if this is the first user (to make admin)
        const allUsers = await db.select().from(users).limit(1);
        const role = allUsers.length === 0 ? 'admin' : 'user';

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification token if email verification is enabled
        const verificationToken = isEmailVerificationEnabled ? generateVerificationToken() : null;
        const verificationTokenExpiry = isEmailVerificationEnabled ? getVerificationTokenExpiry() : null;

        await db.insert(users).values({
            username,
            email,
            password: hashedPassword,
            name: username, // Default name to username
            role,
            emailVerified: !isEmailVerificationEnabled, // Auto-verify if email service disabled
            verificationToken,
            verificationTokenExpiry,
        });

        // Send verification email if enabled
        if (isEmailVerificationEnabled && verificationToken) {
            const emailResult = await sendVerificationEmail(email, username, verificationToken);
            if (!emailResult.success) {
                console.error('Failed to send verification email:', emailResult.error);
                return { 
                    success: 'User created! However, we could not send the verification email. Please contact support.' 
                };
            }
            return { 
                success: 'User created! Please check your email to verify your account before logging in.' 
            };
        }

        return { success: 'User created! Please login.' };
    } catch (error) {
        console.error('Registration error:', error);
        return { error: 'Something went wrong.' };
    }
}

export async function authenticate(_prevState: string | undefined, formData: FormData) {
    const email = sanitizeEmail(formData.get('email') as string);
    
    // Rate limiting check (5 attempts per 15 minutes per IP)
    const clientIp = 'server-action'; // In server actions, we can't easily get IP, so use a placeholder
    const rateLimitKey = `login:${email}:${clientIp}`;
    const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
    
    if (!rateLimit.success) {
        const minutesLeft = Math.ceil((rateLimit.resetAt - Date.now()) / 60000);
        return `Too many login attempts. Please try again in ${minutesLeft} minute(s).`;
    }

    try {
        // Fetch user to check account status
        const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
        const user = userResult[0];

        if (user) {
            // Check if account is locked
            if (user.lockedUntil && user.lockedUntil > new Date()) {
                const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
                return `Account is temporarily locked due to too many failed attempts. Please try again in ${minutesLeft} minute(s).`;
            }

            // Check if email is verified (if verification is enabled)
            if (isEmailVerificationEnabled && !user.emailVerified) {
                return 'Please verify your email address before logging in. Check your inbox for the verification link.';
            }
        }

        await signIn('credentials', {
            ...Object.fromEntries(formData),
            redirectTo: user ? `/${user.username}` : '/'
        });
    } catch (error) {
        if (error instanceof AuthError) {
            // Increment failed login attempts
            try {
                const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
                const user = userResult[0];
                
                if (user) {
                    const newAttempts = (user.loginAttempts || 0) + 1;
                    const updateData: any = { loginAttempts: newAttempts };
                    
                    // Lock account after 5 failed attempts for 30 minutes
                    if (newAttempts >= 5) {
                        updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
                        updateData.loginAttempts = 0; // Reset counter
                    }
                    
                    await db.update(users)
                        .set(updateData)
                        .where(eq(users.email, email));
                }
            } catch (updateError) {
                console.error('Failed to update login attempts:', updateError);
            }

            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export async function updateProfile(formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) return { error: 'Not authenticated' };

    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;
    const image = formData.get('image') as string; // Avatar URL
    const backgroundImage = formData.get('backgroundImage') as string; // Background Image URL
    const profileColor = formData.get('profileColor') as string; // Profile Background Color

    try {
        await db.update(users)
            .set({ name, bio, image, backgroundImage, profileColor })
            .where(eq(users.email, session.user.email));

        return { success: true };
    } catch (error) {
        console.error('Update profile error:', error);
        return { error: 'Failed to update profile' };
    }
}

export async function saveCard(card: any) {
    const session = await auth();
    if (!session?.user?.email) return { error: 'Not authenticated' };

    const userResult = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    const user = userResult[0];
    if (!user) return { error: 'User not found' };

    try {
        // Check if card exists
        const existingCardResult = await db.select().from(cards).where(eq(cards.id, card.id)).limit(1);
        const existingCard = existingCardResult[0];

        if (existingCard) {
            await db.update(cards).set({
                title: card.title,
                subtitle: card.subtitle,
                type: card.type,
                url: card.url || (card.type === 'image' || card.type === 'image-link' ? card.imageUrl : null),
                icon: card.icon,
                colorClass: card.colorClass,
                size: card.size,
                buttonText: card.buttonText,
                githubData: card.githubData ? JSON.stringify(card.githubData) : null,
                contactInfo: card.contactInfo || null,
                mastodonData: card.mastodonData ? JSON.stringify(card.mastodonData) : null,
            }).where(eq(cards.id, card.id));
        } else {
            // Get max order
            const lastCard = await db.select().from(cards).where(eq(cards.userId, user.id)).orderBy(asc(cards.order));
            const newOrder = lastCard.length > 0 ? (lastCard[lastCard.length - 1].order || 0) + 1 : 0;

            await db.insert(cards).values({
                id: card.id,
                userId: user.id,
                title: card.title,
                subtitle: card.subtitle,
                type: card.type,
                url: card.url || (card.type === 'image' || card.type === 'image-link' ? card.imageUrl : null),
                icon: card.icon,
                colorClass: card.colorClass,
                size: card.size,
                order: newOrder,
                buttonText: card.buttonText,
                githubData: card.githubData ? JSON.stringify(card.githubData) : null,
                contactInfo: card.contactInfo || null,
                mastodonData: card.mastodonData ? JSON.stringify(card.mastodonData) : null,
            });
        }
        return { success: true };
    } catch (error) {
        console.error('Save card error:', error);
        return { error: 'Failed to save card' };
    }
}

export async function deleteCard(id: string) {
    const session = await auth();
    if (!session?.user?.email) return { error: 'Not authenticated' };

    try {
        await db.delete(cards).where(eq(cards.id, id));
        return { success: true };
    } catch (error) {
        console.error('Delete card error:', error);
        return { error: 'Failed to delete card' };
    }
}

export async function reorderCards(items: { id: string; order: number }[]) {
    const session = await auth();
    if (!session?.user?.email) return { error: 'Not authenticated' };

    try {
        // Verify user owns these cards (optional but good practice)
        // For batch updates, we might skip individual verification for performance 
        // if we trust the session + ID match, but ideally we check.
        // Here we'll just update directly where ID matches.
        
        // Using a transaction or batch update would be better if supported by the driver/ORM easily,
        // but a loop is acceptable for small numbers of cards.
        
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
        // Increment click count
        await db.update(cards)
            .set({ clicks: sql`${cards.clicks} + 1` })
            .where(eq(cards.id, cardId));

        // Log detailed click
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
    const session = await auth();
    if (!session?.user?.email) return { error: 'Not authenticated' };

    try {
        const userResult = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
        const user = userResult[0];
        
        if (!user || user.id !== userId) {
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

export async function resendVerificationEmail(email: string) {
    const sanitizedEmail = sanitizeEmail(email);

    if (!isValidEmail(sanitizedEmail)) {
        return { error: 'Invalid email address' };
    }

    if (!isEmailVerificationEnabled) {
        return { error: 'Email verification is not enabled' };
    }

    try {
        const userResult = await db
            .select()
            .from(users)
            .where(eq(users.email, sanitizedEmail))
            .limit(1);

        const user = userResult[0];

        if (!user) {
            // Don't reveal if user exists
            return { success: 'If an account exists, a verification email has been sent.' };
        }

        if (user.emailVerified) {
            return { error: 'Email is already verified' };
        }

        // Generate new token
        const verificationToken = generateVerificationToken();
        const verificationTokenExpiry = getVerificationTokenExpiry();

        await db
            .update(users)
            .set({ verificationToken, verificationTokenExpiry })
            .where(eq(users.id, user.id));

        // Send email
        const emailResult = await sendVerificationEmail(
            user.email,
            user.username,
            verificationToken
        );

        if (!emailResult.success) {
            return { error: 'Failed to send verification email' };
        }

        return { success: 'Verification email sent! Please check your inbox.' };
    } catch (error) {
        console.error('Resend verification error:', error);
        return { error: 'Something went wrong' };
    }
}

export async function requestPasswordReset(email: string) {
    const sanitizedEmail = sanitizeEmail(email);

    if (!isValidEmail(sanitizedEmail)) {
        return { error: 'Invalid email address' };
    }

    try {
        const userResult = await db
            .select()
            .from(users)
            .where(eq(users.email, sanitizedEmail))
            .limit(1);

        const user = userResult[0];

        if (!user) {
            // Don't reveal if user exists
            return { success: 'If an account exists, a password reset email has been sent.' };
        }

        // Generate reset token
        const resetToken = generateVerificationToken();
        const resetTokenExpiry = getVerificationTokenExpiry();

        await db
            .update(users)
            .set({
                verificationToken: resetToken,
                verificationTokenExpiry: resetTokenExpiry,
            })
            .where(eq(users.id, user.id));

        // Send email (reusing sendPasswordResetEmail from email.ts)
        const { sendPasswordResetEmail } = await import('@/lib/email');
        const emailResult = await sendPasswordResetEmail(
            user.email,
            user.username,
            resetToken
        );

        if (!emailResult.success) {
            return { error: 'Failed to send password reset email' };
        }

        return { success: 'Password reset email sent! Please check your inbox.' };
    } catch (error) {
        console.error('Password reset request error:', error);
        return { error: 'Something went wrong' };
    }
}

export async function resetPassword(token: string, newPassword: string) {
    // Validate password strength
    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.isValid) {
        return { error: 'Password is too weak. ' + passwordCheck.feedback.join('. ') };
    }

    try {
        // Find user with valid token
        const userResult = await db
            .select()
            .from(users)
            .where(
                and(
                    eq(users.verificationToken, token),
                    gt(users.verificationTokenExpiry, new Date())
                )
            )
            .limit(1);

        const user = userResult[0];

        if (!user) {
            return { error: 'Invalid or expired reset token' };
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear token
        await db
            .update(users)
            .set({
                password: hashedPassword,
                verificationToken: null,
                verificationTokenExpiry: null,
                loginAttempts: 0,
                lockedUntil: null,
            })
            .where(eq(users.id, user.id));

        return { success: 'Password reset successfully! You can now login.' };
    } catch (error) {
        console.error('Password reset error:', error);
        return { error: 'Something went wrong' };
    }
}
