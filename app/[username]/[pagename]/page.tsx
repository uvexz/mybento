import { notFound } from 'next/navigation';
import { getPageProfile } from '@/lib/data';
import BentoGrid from '@/components/bento/BentoGrid';
import { auth, type ExtendedSession } from '@/lib/auth';
import { headers } from 'next/headers';
import { Metadata } from 'next';

interface PageProps {
    params: Promise<{ username: string; pagename: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { username, pagename } = await params;
    const data = await getPageProfile(username, pagename);

    if (!data) {
        return {
            title: 'Page Not Found',
        };
    }

    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'mybento';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const pageUrl = `${siteUrl}/${username}/${pagename}`;

    return {
        title: `${data.profile.name} | ${data.user.name}`,
        description: data.profile.bio || `Check out ${data.profile.name}`,
        openGraph: {
            title: data.profile.name,
            description: data.profile.bio || `Check out ${data.profile.name}`,
            url: pageUrl,
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
            description: data.profile.bio || `Check out ${data.profile.name}`,
            images: [data.profile.avatarUrl],
        },
        alternates: {
            canonical: pageUrl,
        },
    };
}

export default async function UserSubPage({ params }: PageProps) {
    const { username, pagename } = await params;
    const data = await getPageProfile(username, pagename);

    if (!data) {
        notFound();
    }

    const session = await auth.api.getSession({
        headers: await headers()
    }) as ExtendedSession | null;

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
