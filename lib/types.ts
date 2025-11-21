import { ReactNode } from 'react';

export enum CardSize {
    Small = 'small', // 1x1
    Medium = 'medium', // 2x1 (Wide)
    Tall = 'tall', // 1x2 (Tall)
    Large = 'large', // 2x2
}

export type CardType = 
    | 'link' 
    | 'social-x' 
    | 'social-insta' 
    | 'social-github' 
    | 'social-mastodon' 
    | 'social-youtube' 
    | 'social-linkedin'
    | 'image' 
    | 'image-link'
    | 'video-youtube'
    | 'video-vimeo'
    | 'music-spotify'
    | 'music-soundcloud'
    | 'email-form'
    | 'calendar';

export interface BentoCardProps {
    id: string;
    title: string;
    subtitle?: string;
    buttonText?: string;
    icon?: string; // String identifier for the icon
    colorClass: string;
    size: CardSize;
    type: CardType;
    url?: string;
    imageUrl?: string;
    // Optional custom component for the complex initial mockups (like Graphs), 
    // usually undefined for new user-created cards
    customComponent?: ReactNode;

    // Actions
    onEdit?: () => void;
    onMove?: (id: string, direction: 'left' | 'right') => void;
    isFirst?: boolean;
    isLast?: boolean;
    className?: string;
}

export interface UserProfile {
    name: string;
    bio: string;
    avatarUrl: string;
    backgroundImage?: string;
    profileColor?: string;
}
