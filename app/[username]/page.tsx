import { notFound } from 'next/navigation';
import { getUserProfile } from '@/lib/data';
import BentoGrid from '@/components/bento/BentoGrid';
import { auth } from '@/auth';
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

    return {
        title: data.profile.name,
        description: data.profile.bio,
    };
}

export default async function UserPage({ params }: PageProps) {
    const { username } = await params;
    const data = await getUserProfile(username);

    if (!data) {
        notFound();
    }

    const session = await auth();
    const isEditable = session?.user?.name === username; // Assuming username is unique and used for login/session

    return (
        <BentoGrid
            initialCards={data.cards}
            initialProfile={data.profile}
            isEditable={isEditable}
        />
    );
}
