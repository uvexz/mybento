import React from 'react';
import { BentoCardProps, CardSize, CardType } from '@/lib/types';
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
import { Calendar, Video } from 'lucide-react';

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
    'calendar': Calendar,
    'video': Video,
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

    // Embed Card Logic
    const isEmbedCard = type.startsWith('video-') || type.startsWith('music-');
    const embedUrl = getEmbedUrl(type, url);

    // Click handler for links
    const handleClick = async (e: React.MouseEvent) => {
        // If clicking actions, don't navigate
        if ((e.target as HTMLElement).closest('.action-btn')) return;

        if (url && type !== 'image' && !isEmbedCard) {
            // Track click
            try {
                await fetch('/api/track-click', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cardId: id }),
                });
            } catch (error) {
                console.error('Failed to track click:', error);
            }
            
            window.open(url, '_blank');
        }
    };

    // Helper function to get embed URL
    function getEmbedUrl(cardType: CardType, originalUrl?: string): string | null {
        if (!originalUrl) return null;

        try {
            if (cardType === 'video-youtube') {
                const videoId = extractYouTubeId(originalUrl);
                return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
            }
            if (cardType === 'video-vimeo') {
                const videoId = extractVimeoId(originalUrl);
                return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
            }
            if (cardType === 'music-spotify') {
                const trackId = extractSpotifyId(originalUrl);
                return trackId ? `https://open.spotify.com/embed/track/${trackId}` : null;
            }
            if (cardType === 'music-soundcloud') {
                return `https://w.soundcloud.com/player/?url=${encodeURIComponent(originalUrl)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
            }
        } catch (error) {
            console.error('Failed to parse embed URL:', error);
        }
        return null;
    }

    function extractYouTubeId(url: string): string | null {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
            /youtube\.com\/embed\/([^&\n?#]+)/,
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    }

    function extractVimeoId(url: string): string | null {
        const match = url.match(/vimeo\.com\/(\d+)/);
        return match ? match[1] : null;
    }

    function extractSpotifyId(url: string): string | null {
        const match = url.match(/spotify\.com\/track\/([^?]+)/);
        return match ? match[1] : null;
    }

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

            {/* Embed Content (Video/Music) */}
            {isEmbedCard && embedUrl && (
                <div className="absolute inset-0 z-0">
                    <iframe
                        src={embedUrl}
                        className="w-full h-full rounded-3xl"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            )}

            {/* Email Form */}
            {type === 'email-form' && (
                <div className="absolute inset-0 z-10 p-6 flex flex-col justify-center">
                    <form onSubmit={(e) => { e.preventDefault(); alert('Email subscription feature coming soon!'); }} className="space-y-3">
                        <h3 className="font-bold text-xl text-gray-900">{title}</h3>
                        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            {buttonText || 'Subscribe'}
                        </button>
                    </form>
                </div>
            )}

            {/* Content Layer */}
            <div className={cn("relative z-10 flex flex-col h-full p-6", isEmbedCard && 'opacity-0 hover:opacity-100 transition-opacity bg-black/50')}>

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
