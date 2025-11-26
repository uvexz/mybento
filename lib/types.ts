import { ReactNode } from 'react';

export enum CardSize {
    Small = 'small', // 1x1
    Medium = 'medium', // 2x1 (Wide)
    Tall = 'tall', // 1x2 (Tall)
    Large = 'large', // 2x2
}

export interface BlogPost {
    title: string;
    link: string;
    pubDate?: string;
}

export type CardType =
    | 'universal'
    | 'text'
    | 'link'
    | 'highlights'
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
    | 'video-bilibili'
    | 'music-spotify'
    | 'music-soundcloud'
    | 'music-netease'
    | 'blog-rss'
    | 'article'
    | 'contact-email'
    | 'contact-phone'
    | 'contact-qq'
    | 'contact-wechat'
    | 'contact-telegram';

export interface GitHubUserData {
    type: 'user';
    login: string;
    name: string;
    bio: string;
    avatar: string;
    followers: number;
    following: number;
    publicRepos: number;
    url: string;
}

export interface GitHubRepoData {
    type: 'repo';
    name: string;
    fullName: string;
    description: string;
    stars: number;
    forks: number;
    language: string;
    url: string;
    owner: {
        login: string;
        avatar: string;
    };
}

export type GitHubData = GitHubUserData | GitHubRepoData;

export interface MastodonData {
    name: string;
    description: string;
    profileUrl: string;
    avatarUrl: string;
    rssUrl: string;
    latestPost: {
        content: string;
        link: string;
        pubDate: string;
        mediaUrl?: string;
        mediaType?: string;
    } | null;
}

export interface BentoCardProps {
    id: string;
    pageId?: string | null; // Optional, if belongs to a specific page
    title: string;
    subtitle?: string;
    buttonText?: string;
    icon?: string; // String identifier for the icon
    colorClass: string;
    customBgColor?: string; // Custom background color (RGBA)
    customTextColor?: string; // Custom text color (RGBA)
    size: CardSize;
    type: CardType;
    url?: string;
    imageUrl?: string;
    githubData?: GitHubData; // GitHub user or repo data
    blogPosts?: BlogPost[]; // Blog RSS posts
    contactInfo?: string; // Encoded contact info (email, phone, qq, wechat, telegram)
    mastodonData?: MastodonData; // Mastodon profile and latest post
    articleContent?: string; // Markdown content for article cards
    // Optional custom component for the complex initial mockups (like Graphs), 
    // usually undefined for new user-created cards
    customComponent?: ReactNode;

    // Actions
    onEdit?: () => void;
    onMove?: (id: string, direction: 'left' | 'right') => void;
    onArticleClick?: (card: { id: string; title: string; subtitle?: string; content: string }) => void;
    isFirst?: boolean;
    isLast?: boolean;
    className?: string;

    // Drag and drop (using unknown to accept @hello-pangea/dnd types)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dragHandleProps?: any;
    isDragging?: boolean;
}

export interface UserProfile {
    name: string;
    bio: string;
    avatarUrl: string;
    backgroundImage?: string;
    profileColor?: string;
}

export interface Page {
    id: string;
    userId: string;
    slug: string;
    title: string;
    subtitle: string | null;
    avatarUrl: string | null;
    backgroundImage: string | null;
    profileColor: string | null;
    createdAt: Date;
    updatedAt: Date;
}
