import React from 'react';
import { BentoCardProps, CardSize } from '@/lib/types';
import {
    Twitter,
    Instagram,
    Github,
    Link as LinkIcon,
    Image as ImageIcon,
    Youtube,
    Coffee,
    BookOpen,
    Figma,
    Smile,
    Edit2,
    Anchor,
    Hash,
    ArrowLeft,
    ArrowRight,
    Music,
    MapPin,
    Mail,
    Linkedin
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Icon mapping for dynamic rendering
export const ICON_MAP: Record<string, React.ElementType> = {
    'twitter': Twitter,
    'instagram': Instagram,
    'github': Github,
    'youtube': Youtube,
    'linkedin': Linkedin,
    'coffee': Coffee,
    'book': BookOpen,
    'figma': Figma,
    'music': Music,
    'map': MapPin,
    'mail': Mail,
    'link': LinkIcon,
    'image': ImageIcon,
    'smile': Smile,
    'anchor': Anchor,
    'hash': Hash,
};

const BentoCard: React.FC<BentoCardProps> = ({
    id,
    title,
    subtitle,
    buttonText,
    icon,
    colorClass,
    size,
    type,
    url,
    imageUrl,
    customComponent,
    onEdit,
    onMove,
    isFirst,
    isLast,
    className = ''
}) => {
    // Determine column span based on size
    const spanClasses = {
        [CardSize.Small]: 'sm:col-span-1 sm:row-span-1',
        [CardSize.Medium]: 'sm:col-span-2 sm:row-span-1',
        [CardSize.Tall]: 'sm:col-span-1 sm:row-span-2',
        [CardSize.Large]: 'sm:col-span-2 sm:row-span-2',
    }[size];

    // Adjust height logic
    const heightClass = (size === CardSize.Large || size === CardSize.Tall) ? 'h-[23rem]' : 'h-44';

    // Render Icon Helper
    const IconComponent = icon && ICON_MAP[icon] ? ICON_MAP[icon] : null;

    // Image Card Logic
    const isImageCard = type === 'image' || type === 'image-link';
    const bgStyle = isImageCard && imageUrl ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};

    // Click handler for links
    const handleClick = (e: React.MouseEvent) => {
        // If clicking actions, don't navigate
        if ((e.target as HTMLElement).closest('.action-btn')) return;

        if (url && type !== 'image') {
            window.open(url, '_blank');
        }
    };

    return (
        <div
            onClick={handleClick}
            className={cn(`
        ${spanClasses} ${heightClass} ${!isImageCard ? colorClass : 'bg-gray-200'} ${className} 
        rounded-3xl relative group transition-all duration-300 
        ${url ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl' : ''} 
        shadow-sm overflow-hidden flex flex-col justify-between
        border border-black/5
      `)}
            style={bgStyle}
        >

            {/* Action Overlay (Edit & Move) */}
            <div className="absolute top-3 right-3 z-50 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Move Left */}
                {onMove && !isFirst && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onMove(id, 'left'); }}
                        className="action-btn p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white text-gray-700 transition-colors"
                        title="Move Previous"
                    >
                        <ArrowLeft size={14} />
                    </button>
                )}

                {/* Move Right */}
                {onMove && !isLast && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onMove(id, 'right'); }}
                        className="action-btn p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white text-gray-700 transition-colors"
                        title="Move Next"
                    >
                        <ArrowRight size={14} />
                    </button>
                )}

                {/* Edit */}
                {onEdit && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="action-btn p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white text-gray-700 transition-colors"
                        title="Edit Card"
                    >
                        <Edit2 size={14} />
                    </button>
                )}
            </div>

            {/* Custom Background Elements (e.g. Graphs, Mockups) */}
            {customComponent && (
                <div className="absolute inset-0 z-0">
                    {customComponent}
                </div>
            )}

            {/* Dark Overlay for Image Cards to make text readable */}
            {isImageCard && (
                <div className="absolute inset-0 bg-black/30 transition-opacity hover:bg-black/40 z-0" />
            )}

            {/* Content Layer */}
            <div className="relative z-10 flex flex-col h-full p-6">

                {/* Header: Icon + Titles */}
                <div className="flex justify-between items-start mb-auto">
                    <div className="flex flex-col gap-1 w-full">
                        {IconComponent && !isImageCard && (
                            <div className={cn(`mb-2 ${type === 'social-github' ? 'text-gray-900' : 'text-gray-800'} opacity-90`)}>
                                <IconComponent size={32} />
                            </div>
                        )}

                        {(title || subtitle) && (
                            <div className={isImageCard ? 'mt-auto text-white' : ''}>
                                {title && (
                                    <h3 className={cn(`font-bold text-xl leading-tight ${isImageCard ? 'text-white text-shadow-sm' : 'text-gray-900'}`)}>
                                        {title}
                                    </h3>
                                )}
                                {subtitle && (
                                    <p className={cn(`text-sm font-medium mt-1 ${isImageCard ? 'text-white/90' : 'text-gray-600'}`)}>
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer: Action Button */}
                {buttonText && !customComponent && (
                    <div className="mt-4">
                        <button className={cn(`
               py-2 px-6 rounded-xl font-semibold text-sm w-full sm:w-auto shadow-sm transition-colors
               ${isImageCard
                                ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/30'
                                : 'bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm'
                            }
             `)}>
                            {buttonText}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BentoCard;
