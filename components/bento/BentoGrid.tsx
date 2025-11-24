'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { BentoCardProps, UserProfile } from '@/lib/types';
import BentoGridView from '@/components/bento/BentoGridView';
import { saveCard, deleteCard } from '@/lib/actions';
import { useRouter } from 'next/navigation';

// Dynamic imports for better code splitting
const FloatingControls = dynamic(() => import('@/components/bento/FloatingControls'), { ssr: false });
const UnifiedCardEditor = dynamic(() => import('@/components/editor/UnifiedCardEditor'), { ssr: false });

interface BentoGridProps {
    initialCards: BentoCardProps[];
    initialProfile: UserProfile;
    isEditable: boolean;
    showProfile?: boolean;
}

interface BentoGridPropsExtended extends BentoGridProps {
    userId?: string;
    username?: string;
    isLoggedIn?: boolean;
    isAdmin?: boolean;
}

export default function BentoGrid({ initialCards, initialProfile, isEditable, showProfile = true, userId, username, isLoggedIn = false, isAdmin = false }: BentoGridPropsExtended) {
    const [cards, setCards] = useState<BentoCardProps[]>(initialCards);
    const [profile, setProfile] = useState<UserProfile>(initialProfile);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<BentoCardProps | null>(null);
    const [articleModalData, setArticleModalData] = useState<{ id: string; title: string; subtitle?: string; content: string } | null>(null);
    const router = useRouter();

    const handleAddCard = () => {
        setEditingCard(null);
        setIsModalOpen(true);
    };

    const handleEditCard = (card: BentoCardProps) => {
        if (!isEditable) return;
        setEditingCard(card);
        setIsModalOpen(true);
    };

    const handleSaveCard = (cardData: BentoCardProps) => {
        if (editingCard) {
            setCards(cards.map(c => c.id === cardData.id ? { ...cardData, customComponent: c.customComponent } : c));
        } else {
            setCards([...cards, { ...cardData, id: crypto.randomUUID() }]);
        }
        setIsModalOpen(false);

        // Persist to DB
        saveCard(cardData).then(() => {
            router.refresh();
        });
    };

    const handleDeleteCard = (id: string) => {
        setCards(cards.filter(c => c.id !== id));
        setIsModalOpen(false);

        // Persist to DB
        deleteCard(id).then(() => {
            router.refresh();
        });
    };

    const handleMove = (id: string, direction: 'left' | 'right') => {
        if (!isEditable) return;

        const currentIndex = cards.findIndex(c => c.id === id);
        if (currentIndex === -1) return;

        const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= cards.length) return;

        const newCards = Array.from(cards);
        const [movedCard] = newCards.splice(currentIndex, 1);
        newCards.splice(newIndex, 0, movedCard);

        setCards(newCards);

        // Persist to DB
        const reorderData = newCards.map((card, idx) => ({ id: card.id, order: idx }));
        import('@/lib/actions').then(({ reorderCards }) => {
            reorderCards(reorderData).then(() => {
                router.refresh();
            });
        });
    };

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;
        if (!isEditable) return;

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        if (sourceIndex === destinationIndex) return;

        const newCards = Array.from(cards);
        const [reorderedItem] = newCards.splice(sourceIndex, 1);
        newCards.splice(destinationIndex, 0, reorderedItem);

        setCards(newCards);

        // Persist to DB
        const reorderData = newCards.map((card, idx) => ({ id: card.id, order: idx }));
        import('@/lib/actions').then(({ reorderCards }) => {
            reorderCards(reorderData).then(() => {
                router.refresh();
            });
        });
    };

    return (
        <>
            <BentoGridView
                cards={cards}
                profile={profile}
                showProfile={showProfile}
                username={username}
                isLoggedIn={isLoggedIn}
                isEditable={isEditable}
                onEditCard={handleEditCard}
                onMove={handleMove}
                onReorder={handleDragEnd}
                onProfileUpdate={setProfile}
                articleModalData={articleModalData}
                setArticleModalData={setArticleModalData}
            />

            {isEditable && (
                <>
                    <FloatingControls
                        onAddCard={handleAddCard}
                        userId={userId}
                        isAdmin={isAdmin}
                    />

                    <UnifiedCardEditor
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleSaveCard}
                        onDelete={handleDeleteCard}
                        initialData={editingCard}
                    />
                </>
            )}
        </>
    );
}
