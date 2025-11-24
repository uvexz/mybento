'use client';

import React from 'react';
import { BentoCardProps, UserProfile } from '@/lib/types';
import BentoCard from '@/components/bento/BentoCard';
import ProfileSection from '@/components/bento/ProfileSection';
import ArticleModal from '@/components/bento/ArticleModal';

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface BentoGridViewProps {
    cards: BentoCardProps[];
    profile: UserProfile;
    showProfile?: boolean;
    username?: string;
    isLoggedIn?: boolean;
    isEditable?: boolean;
    onEditCard?: (card: BentoCardProps) => void;
    onMove?: (id: string, direction: 'left' | 'right') => void;
    onReorder?: (result: DropResult) => void;
    onProfileUpdate?: (profile: UserProfile) => void;
    articleModalData: { id: string; title: string; subtitle?: string; content: string } | null;
    setArticleModalData: (data: { id: string; title: string; subtitle?: string; content: string } | null) => void;
}

const BentoGridView: React.FC<BentoGridViewProps> = ({
    cards,
    profile,
    showProfile = true,
    username,
    isLoggedIn = false,
    isEditable = false,
    onEditCard,
    onMove,
    onReorder,
    onProfileUpdate,
    articleModalData,
    setArticleModalData
}) => {
    return (
        <div
            className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-40 overflow-x-hidden font-sans transition-all duration-500"
            style={profile.backgroundImage ? {
                backgroundImage: `url(${profile.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            } : {}}
        >
            <div className="bg-noise" />
            {/* Main Container */}
            <div className="transition-all duration-500 ease-in-out flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-16 w-full max-w-6xl">

                {/* Left/Top: Profile & Stats */}
                {showProfile && (
                    <div className="flex-shrink-0 w-full lg:w-1/3 space-y-6 px-2 sm:px-0">
                        <ProfileSection
                            profile={profile}
                            setProfile={onProfileUpdate}
                            isEditable={isEditable}
                            username={username}
                            isLoggedIn={isLoggedIn}
                        />
                    </div>
                )}

                {/* Right/Bottom: Grid */}
                <div className="flex-grow w-full px-2 sm:px-0">
                    {isEditable && onReorder ? (
                        <DragDropContext onDragEnd={onReorder}>
                            <Droppable droppableId="bento-grid">
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`grid gap-3 sm:gap-4 grid-flow-row-dense grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 transition-colors ${
                                            snapshot.isDraggingOver ? 'bg-blue-50/50 rounded-2xl p-2' : ''
                                        }`}
                                    >
                                        {cards.map((card, index) => (
                                            <Draggable key={card.id} draggableId={card.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`
                                                            ${card.size === 'medium' || card.size === 'large' ? 'sm:col-span-2' : 'sm:col-span-1'}
                                                            ${card.size === 'tall' || card.size === 'large' ? 'sm:row-span-2' : 'sm:row-span-1'}
                                                            ${snapshot.isDragging ? 'opacity-80 scale-105 rotate-2 z-50' : ''}
                                                            transition-all duration-200
                                                        `}
                                                    >
                                                        <BentoCard
                                                            {...card}
                                                            onEdit={isEditable && onEditCard ? () => onEditCard(card) : undefined}
                                                            onMove={isEditable && onMove ? onMove : undefined}
                                                            onArticleClick={setArticleModalData}
                                                            isFirst={index === 0}
                                                            isLast={index === cards.length - 1}
                                                            dragHandleProps={provided.dragHandleProps}
                                                            isDragging={snapshot.isDragging}
                                                        />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    ) : (
                        <div className="grid gap-3 sm:gap-4 grid-flow-row-dense grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {cards.map((card, index) => (
                                <BentoCard
                                    key={card.id}
                                    {...card}
                                    onEdit={isEditable && onEditCard ? () => onEditCard(card) : undefined}
                                    onMove={isEditable && onMove ? onMove : undefined}
                                    onArticleClick={setArticleModalData}
                                    isFirst={index === 0}
                                    isLast={index === cards.length - 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Article Modal */}
            {articleModalData && (
                <ArticleModal
                    isOpen={true}
                    onClose={() => setArticleModalData(null)}
                    title={articleModalData.title}
                    subtitle={articleModalData.subtitle}
                    content={articleModalData.content}
                />
            )}
        </div>
    );
};

export default BentoGridView;
