'use client';

import { RiMastodonFill, RiTimeFill } from '@remixicon/react';
import { MastodonData } from '@/lib/types';

interface MastodonCardProps {
    data?: MastodonData;
    title?: string;
}

export default function MastodonCard({ data, title }: MastodonCardProps) {

    // Format relative time
    const formatRelativeTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) return 'just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;
            return date.toLocaleDateString();
        } catch {
            return '';
        }
    };

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white/60 p-6">
                <RiMastodonFill size={24} className="mb-2" />
                <p className="text-sm text-center">No Mastodon data available</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full p-6">
            {/* Profile Header */}
            <div className="flex items-start gap-3 mb-4">
                {data.avatarUrl && (
                    <img 
                        src={data.avatarUrl} 
                        alt={data.name}
                        loading="lazy"
                        className="w-12 h-12 rounded-full border-2 border-white/20 flex-shrink-0"
                    />
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-white truncate">
                        {title || data.name}
                    </h3>
                    {data.description && (
                        <p className="text-xs text-white/70 line-clamp-1">
                            {data.description.replace('Public posts from ', '')}
                        </p>
                    )}
                </div>
                <RiMastodonFill size={20} className="text-white/60 flex-shrink-0" />
            </div>

            {/* Latest Post */}
            {data.latestPost && (
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs text-white/60 mb-2">
                        <RiTimeFill size={12} />
                        <span suppressHydrationWarning>
                            Latest post · {formatRelativeTime(data.latestPost.pubDate)}
                        </span>
                    </div>
                    
                    <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-3 overflow-hidden">
                        <p className="text-sm text-white/90 line-clamp-4">
                            {data.latestPost.content}
                        </p>
                        
                        {/* Media preview if available */}
                        {data.latestPost.mediaUrl && data.latestPost.mediaType?.startsWith('image') && (
                            <img 
                                src={data.latestPost.mediaUrl}
                                alt="Post media"
                                loading="lazy"
                                className="mt-2 rounded-lg w-full h-24 object-cover"
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Follow Button */}
            <a
                href={data.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg py-2.5 px-4 font-semibold text-sm text-white text-center transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                Follow on Mastodon
            </a>
        </div>
    );
}
