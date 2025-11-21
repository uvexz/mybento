'use client';

import React, { useState } from 'react';
import { BentoCardProps, UserProfile } from '@/lib/types';
import BentoCard from '@/components/bento/BentoCard';
import FloatingControls from '@/components/bento/FloatingControls';
import CardEditorModal from '@/components/editor/CardEditorModal';
import ProfileSection from '@/components/bento/ProfileSection';
import StatsPanel from '@/components/bento/StatsPanel';
import ExportImportButtons from '@/components/bento/ExportImportButtons';
import { saveCard, deleteCard } from '@/lib/actions';
import { useRouter } from 'next/navigation';

interface BentoGridProps {
    initialCards: BentoCardProps[];
    initialProfile: UserProfile;
    isEditable: boolean;
    showProfile?: boolean;
}

interface BentoGridPropsExtended extends BentoGridProps {
    userId?: string;
    username?: string;
}

export default function BentoGrid({ initialCards, initialProfile, isEditable, showProfile = true, userId, username }: BentoGridPropsExtended) {
    const [cards, setCards] = useState<BentoCardProps[]>(initialCards);
    const [profile, setProfile] = useState<UserProfile>(initialProfile);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<BentoCardProps | null>(null);
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

    const handleMoveCard = (id: string, direction: 'left' | 'right') => {
        if (!isEditable) return;
        const index = cards.findIndex(c => c.id === id);
        if (index === -1) return;

        const newCards = [...cards];
        const swapIndex = direction === 'left' ? index - 1 : index + 1;

        if (swapIndex >= 0 && swapIndex < newCards.length) {
            [newCards[index], newCards[swapIndex]] = [newCards[swapIndex], newCards[index]];
            setCards(newCards);
            
            // Persist to DB
            const reorderData = newCards.map((card, idx) => ({ id: card.id, order: idx }));
            import('@/lib/actions').then(({ reorderCards }) => {
                reorderCards(reorderData).then(() => {
                    router.refresh();
                });
            });
        }
    };

    return (
        <div
            className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-8 pb-32 overflow-x-hidden font-sans transition-all duration-500"
            style={profile.backgroundImage ? {
                backgroundImage: `url(${profile.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            } : {}}
        >

            {/* Main Container */}
            <div className="transition-all duration-500 ease-in-out flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-16 w-full max-w-6xl">
                
                {/* Stats Panel (only for editable/owner view) */}
                {isEditable && userId && (
                    <div className="w-full lg:hidden">
                        <StatsPanel userId={userId} />
                    </div>
                )}

                {/* Left/Top: Profile & Stats */}
                {showProfile && (
                    <div className="flex-shrink-0 w-full lg:w-1/3 space-y-6">
                        <ProfileSection
                            profile={profile}
                            setProfile={isEditable ? setProfile : undefined}
                            isEditable={isEditable}
                            username={userId ? profile.name : undefined}
                        />
                        
                        {/* Stats Panel (desktop only) */}
                        {isEditable && userId && (
                            <div className="hidden lg:block">
                                <StatsPanel userId={userId} />
                            </div>
                        )}

                        {/* Export/Import Buttons */}
                        {isEditable && (
                            <div className="hidden lg:block space-y-4">
                                <ExportImportButtons />
                            </div>
                        )}
                    </div>
                )}

                {/* Right/Bottom: Grid */}
                <div className="flex-grow w-full">
                    <div className="grid gap-4 grid-flow-row-dense grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

                        {cards.map((card, index) => (
                            <BentoCard
                                key={card.id}
                                {...card}
                                onEdit={isEditable ? () => handleEditCard(card) : undefined}
                                onMove={isEditable ? handleMoveCard : undefined}
                                isFirst={index === 0}
                                isLast={index === cards.length - 1}
                            />
                        ))}

                    </div>
                </div>

            </div>

            {isEditable && (
                <>
                    <FloatingControls
                        onAddCard={handleAddCard}
                    />

                    <CardEditorModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleSaveCard}
                        onDelete={handleDeleteCard}
                        initialData={editingCard}
                    />
                </>
            )}

        </div>
    );
}
