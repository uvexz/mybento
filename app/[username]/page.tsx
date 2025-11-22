import { notFound } from 'next/navigation';
import { getUserProfile } from '@/lib/data';
import BentoGrid from '@/components/bento/BentoGrid';
import { auth, type ExtendedSession } from '@/lib/auth';
import { headers } from 'next/headers';
import { Metadata } from 'next';

interface PageProps {
    params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { username } = await params;
    const data = await getUserProfile(username);

    if (!data) {
        return {
            title: 'User Not Found',
        };
    }

    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'mybento';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const profileUrl = `${siteUrl}/${username}`;

    return {
        title: data.profile.name,
        description: data.profile.bio || `Check out ${data.profile.name}'s links and content`,
        openGraph: {
            title: data.profile.name,
            description: data.profile.bio || `Check out ${data.profile.name}'s links and content`,
            url: profileUrl,
            siteName: siteName,
            images: [
                {
                    url: data.profile.avatarUrl,
                    width: 1200,
                    height: 630,
                    alt: data.profile.name,
                },
            ],
            locale: 'en_US',
            type: 'profile',
        },
        twitter: {
            card: 'summary_large_image',
            title: data.profile.name,
            description: data.profile.bio || `Check out ${data.profile.name}'s links and content`,
            images: [data.profile.avatarUrl],
        },
        alternates: {
            canonical: profileUrl,
        },
    };
}

export default async function UserPage({ params }: PageProps) {
    const { username } = await params;
    const data = await getUserProfile(username);

    if (!data) {
        notFound();
    }

    const session = await auth.api.getSession({
        headers: await headers()
    }) as ExtendedSession | null;
    
    // 使用 username 字段来判断是否是页面所有者
    const isEditable = session?.user?.username === username;
    const isAdmin = data.user.role === 'admin';

    return (
        <BentoGrid
            initialCards={data.cards}
            initialProfile={data.profile}
            isEditable={isEditable}
            userId={data.user.id}
            username={username}
            isLoggedIn={!!session?.user}
            isAdmin={isAdmin}
        />
    );
}
