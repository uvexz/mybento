'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { users, cards } from '@/lib/schema';
import { eq, asc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signIn, auth } from '@/auth';
import { AuthError } from 'next-auth';

const RegisterSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function register(formData: FormData) {
    const validatedFields = RegisterSchema.safeParse({
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
    });

    if (!validatedFields.success) {
        return { error: 'Invalid fields' };
    }

    const { email, password, username } = validatedFields.data;

    try {
        // Check if user exists
        const existingUserResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existingUserResult.length > 0) {
            return { error: 'Email already in use' };
        }

        const existingUsernameResult = await db.select().from(users).where(eq(users.username, username)).limit(1);
        if (existingUsernameResult.length > 0) {
            return { error: 'Username already taken' };
        }

        // Check if this is the first user (to make admin)
        const allUsers = await db.select().from(users).limit(1);
        const role = allUsers.length === 0 ? 'admin' : 'user';

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.insert(users).values({
            username,
            email,
            password: hashedPassword,
            name: username, // Default name to username
            role,
        });

        return { success: 'User created! Please login.' };
    } catch (error) {
        console.error('Registration error:', error);
        return { error: 'Something went wrong.' };
    }
}

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        // Fetch user to get username for redirect
        const email = formData.get('email') as string;
        const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
        const user = userResult[0];

        await signIn('credentials', {
            ...Object.fromEntries(formData),
            redirectTo: user ? `/${user.username}` : '/'
        });
    } catch (error) {
        if (error instanceof AuthError) {
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
