import React, { useState, useEffect } from 'react';
import { BentoCardProps, CardSize, CardType } from '@/lib/types';
import { ICON_MAP } from '@/components/bento/BentoCard';
import { 
    RiCloseLine, 
    RiDeleteBinLine, 
    RiLayoutGridFill,
    RiRefreshFill,
    RiCloseCircleFill,
    RiCheckboxCircleFill,
    RiMailFill,
    RiPhoneFill,
    RiQqFill,
    RiWechatFill,
    RiTelegramFill,
    RiInformationFill,
    RiShieldCheckFill,
    RiArrowLeftLine,
    RiPaletteFill,
} from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUpload from '@/components/ImageUpload';

interface CardEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (card: BentoCardProps) => void;
    onDelete: (id: string) => void;
    initialData: BentoCardProps | null;
}

const COLORS = [
    // Brand Colors
    { name: 'Twitter Blue', class: 'bg-[#1DA1F2]/80 text-white', bg: '#1DA1F2', text: '#ffffff', category: 'brand' },
    { name: 'YouTube Red', class: 'bg-[#FF0000]/80 text-white', bg: '#FF0000', text: '#ffffff', category: 'brand' },
    { name: 'GitHub Green', class: 'bg-[#2dba4e]/80 text-white', bg: '#2dba4e', text: '#ffffff', category: 'brand' },
    { name: 'LinkedIn Blue', class: 'bg-[#0A66C2]/80 text-white', bg: '#0A66C2', text: '#ffffff', category: 'brand' },
    { name: 'Spotify Green', class: 'bg-[#1DB954]/80 text-white', bg: '#1DB954', text: '#ffffff', category: 'brand' },
    { name: 'Instagram Pink', class: 'bg-[#E4405F]/80 text-white', bg: '#E4405F', text: '#ffffff', category: 'brand' },
    { name: 'Figma Purple', class: 'bg-[#A259FF]/80 text-white', bg: '#A259FF', text: '#ffffff', category: 'brand' },
    { name: 'SoundCloud Orange', class: 'bg-[#FF5500]/80 text-white', bg: '#FF5500', text: '#ffffff', category: 'brand' },
    { name: 'Discord Purple', class: 'bg-[#5865F2]/80 text-white', bg: '#5865F2', text: '#ffffff', category: 'brand' },
    { name: 'Twitch Purple', class: 'bg-[#9146FF]/80 text-white', bg: '#9146FF', text: '#ffffff', category: 'brand' },
    { name: 'TikTok Black', class: 'bg-[#000000]/80 text-white', bg: '#000000', text: '#ffffff', category: 'brand' },
    { name: 'Pinterest Red', class: 'bg-[#E60023]/80 text-white', bg: '#E60023', text: '#ffffff', category: 'brand' },
    
    // Vibrant Colors
    { name: 'Red', class: 'bg-red-500/80 text-white', bg: '#ef4444', text: '#ffffff', category: 'vibrant' },
    { name: 'Orange', class: 'bg-orange-500/80 text-white', bg: '#f97316', text: '#ffffff', category: 'vibrant' },
    { name: 'Amber', class: 'bg-amber-500/80 text-white', bg: '#f59e0b', text: '#ffffff', category: 'vibrant' },
    { name: 'Yellow', class: 'bg-yellow-400/80 text-black', bg: '#facc15', text: '#000000', category: 'vibrant' },
    { name: 'Lime', class: 'bg-lime-500/80 text-white', bg: '#84cc16', text: '#ffffff', category: 'vibrant' },
    { name: 'Green', class: 'bg-green-500/80 text-white', bg: '#22c55e', text: '#ffffff', category: 'vibrant' },
    { name: 'Emerald', class: 'bg-emerald-500/80 text-white', bg: '#10b981', text: '#ffffff', category: 'vibrant' },
    { name: 'Teal', class: 'bg-teal-500/80 text-white', bg: '#14b8a6', text: '#ffffff', category: 'vibrant' },
    { name: 'Cyan', class: 'bg-cyan-500/80 text-white', bg: '#06b6d4', text: '#ffffff', category: 'vibrant' },
    { name: 'Sky', class: 'bg-sky-500/80 text-white', bg: '#0ea5e9', text: '#ffffff', category: 'vibrant' },
    { name: 'Blue', class: 'bg-blue-500/80 text-white', bg: '#3b82f6', text: '#ffffff', category: 'vibrant' },
    { name: 'Indigo', class: 'bg-indigo-500/80 text-white', bg: '#6366f1', text: '#ffffff', category: 'vibrant' },
    { name: 'Violet', class: 'bg-violet-500/80 text-white', bg: '#8b5cf6', text: '#ffffff', category: 'vibrant' },
    { name: 'Purple', class: 'bg-purple-500/80 text-white', bg: '#a855f7', text: '#ffffff', category: 'vibrant' },
    { name: 'Fuchsia', class: 'bg-fuchsia-500/80 text-white', bg: '#d946ef', text: '#ffffff', category: 'vibrant' },
    { name: 'Pink', class: 'bg-pink-500/80 text-white', bg: '#ec4899', text: '#ffffff', category: 'vibrant' },
    { name: 'Rose', class: 'bg-rose-500/80 text-white', bg: '#f43f5e', text: '#ffffff', category: 'vibrant' },
    
    // Pastel Colors
    { name: 'Pastel Red', class: 'bg-red-300/80 text-red-900', bg: '#fca5a5', text: '#7f1d1d', category: 'pastel' },
    { name: 'Pastel Orange', class: 'bg-orange-300/80 text-orange-900', bg: '#fdba74', text: '#7c2d12', category: 'pastel' },
    { name: 'Pastel Yellow', class: 'bg-yellow-300/80 text-yellow-900', bg: '#fde047', text: '#713f12', category: 'pastel' },
    { name: 'Pastel Green', class: 'bg-green-300/80 text-green-900', bg: '#86efac', text: '#14532d', category: 'pastel' },
    { name: 'Pastel Blue', class: 'bg-blue-300/80 text-blue-900', bg: '#93c5fd', text: '#1e3a8a', category: 'pastel' },
    { name: 'Pastel Purple', class: 'bg-purple-300/80 text-purple-900', bg: '#d8b4fe', text: '#581c87', category: 'pastel' },
    { name: 'Pastel Pink', class: 'bg-pink-300/80 text-pink-900', bg: '#f9a8d4', text: '#831843', category: 'pastel' },
    
    // Dark Colors
    { name: 'Dark Red', class: 'bg-red-900/80 text-red-100', bg: '#7f1d1d', text: '#fee2e2', category: 'dark' },
    { name: 'Dark Orange', class: 'bg-orange-900/80 text-orange-100', bg: '#7c2d12', text: '#ffedd5', category: 'dark' },
    { name: 'Dark Green', class: 'bg-green-900/80 text-green-100', bg: '#14532d', text: '#dcfce7', category: 'dark' },
    { name: 'Dark Blue', class: 'bg-blue-900/80 text-blue-100', bg: '#1e3a8a', text: '#dbeafe', category: 'dark' },
    { name: 'Dark Purple', class: 'bg-purple-900/80 text-purple-100', bg: '#581c87', text: '#f3e8ff', category: 'dark' },
    { name: 'Dark Pink', class: 'bg-pink-900/80 text-pink-100', bg: '#831843', text: '#fce7f3', category: 'dark' },
    
    // Neutrals
    { name: 'White', class: 'bg-white/80 text-black', bg: '#ffffff', text: '#000000', category: 'neutral' },
    { name: 'Gray Light', class: 'bg-gray-100/80 text-black', bg: '#f3f4f6', text: '#000000', category: 'neutral' },
    { name: 'Gray', class: 'bg-gray-400/80 text-white', bg: '#9ca3af', text: '#ffffff', category: 'neutral' },
    { name: 'Gray Dark', class: 'bg-gray-700/80 text-white', bg: '#374151', text: '#ffffff', category: 'neutral' },
    { name: 'Black', class: 'bg-gray-900/80 text-white', bg: '#111827', text: '#ffffff', category: 'neutral' },
    
    // Gradients (represented as solid colors for preview)
    { name: 'Sunset', class: 'bg-gradient-to-r from-orange-500 to-pink-500 text-white', bg: '#f97316', text: '#ffffff', category: 'gradient' },
    { name: 'Ocean', class: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white', bg: '#3b82f6', text: '#ffffff', category: 'gradient' },
    { name: 'Forest', class: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white', bg: '#22c55e', text: '#ffffff', category: 'gradient' },
    { name: 'Purple Haze', class: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white', bg: '#a855f7', text: '#ffffff', category: 'gradient' },
    { name: 'Fire', class: 'bg-gradient-to-r from-red-500 to-yellow-500 text-white', bg: '#ef4444', text: '#ffffff', category: 'gradient' },
];

// Icon categories for filtering
const ICON_CATEGORIES: Record<string, string[]> = {
    social: ['twitter', 'instagram', 'github', 'youtube', 'linkedin', 'mastodon', 'spotify', 'soundcloud', 'vimeo', 'discord', 'twitch', 'tiktok', 'pinterest', 'slack', 'dribbble', 'behance', 'medium', 'reddit', 'whatsapp', 'telegram', 'wechat', 'qq', 'weibo', 'snapchat', 'patreon', 'producthunt', 'stackoverflow', 'npm', 'apple', 'android', 'windows', 'chrome', 'firefox', 'safari', 'edge', 'opera', 'figma'],
    common: ['home', 'link', 'mail', 'phone', 'message', 'chat', 'feedback', 'question-answer', 'user', 'team', 'user-heart', 'user-star', 'user-add', 'user-follow', 'user-unfollow', 'heart', 'star', 'bookmark', 'flag', 'eye', 'eye-off', 'eye-close', 'smile', 'anchor', 'hash'],
    content: ['book', 'article', 'blog', 'pencil', 'draft', 'file', 'file-paper', 'folder', 'archive', 'inbox', 'send', 'share', 'external-link', 'attachment', 'pushpin'],
    media: ['image', 'gallery', 'camera', 'video', 'movie', 'film', 'music', 'headphone', 'mic', 'volume', 'volume-down', 'volume-mute', 'play', 'pause', 'stop', 'skip-forward', 'skip-back', 'fullscreen', 'picture-in-picture'],
    tech: ['code', 'terminal', 'database', 'server', 'computer', 'smartphone', 'tools', 'settings', 'download', 'upload'],
    business: ['briefcase', 'shopping', 'cart', 'store', 'wallet', 'card', 'tag', 'coupon', 'gift'],
    ui: ['calendar', 'time', 'alarm', 'notification', 'question', 'info', 'alert', 'check', 'close', 'add', 'subtract', 'search', 'zoom-in', 'filter', 'sort', 'layout-grid', 'layout-masonry', 'sidebar', 'menu', 'more', 'refresh', 'loop', 'repeat', 'shuffle', 'logout', 'login'],
    nature: ['coffee', 'fire', 'sun', 'moon', 'leaf', 'flower', 'bug', 'rocket', 'trophy', 'medal', 'lightbulb', 'compass', 'globe', 'shield', 'shield-check', 'lock', 'lock-unlock', 'key', 'fingerprint', 'map', 'location', 'palette', 'paint', 'game'],
};

// Presets for smart auto-fill
const TYPE_PRESETS: Partial<Record<CardType, Partial<BentoCardProps>>> = {
    'social-x': { icon: 'twitter', colorClass: 'bg-[#1DA1F2]/80 text-white', buttonText: 'Follow' },
    'social-insta': { icon: 'instagram', colorClass: 'bg-white/80 text-black', buttonText: 'Follow' },
    'social-github': { icon: 'github', colorClass: 'bg-[#2dba4e]/80 text-white', buttonText: 'Follow' },
    'social-youtube': { icon: 'youtube', colorClass: 'bg-[#FF0000]/80 text-white', buttonText: 'Subscribe' },
    'social-mastodon': { icon: 'mastodon', colorClass: 'bg-[#6364FF]/80 text-white', buttonText: 'Follow', size: CardSize.Medium },
    'social-linkedin': { icon: 'linkedin', colorClass: 'bg-[#0A66C2]/80 text-white', buttonText: 'Connect' },
    'image': { icon: undefined, buttonText: '' },
    'image-link': { icon: undefined, buttonText: 'Visit' },
    'video-youtube': { icon: 'youtube', colorClass: 'bg-[#FF0000]/80 text-white', buttonText: 'Watch', size: CardSize.Large },
    'video-vimeo': { icon: 'link', colorClass: 'bg-[#1AB7EA]/80 text-white', buttonText: 'Watch', size: CardSize.Large },
    'music-spotify': { icon: 'music', colorClass: 'bg-[#1DB954]/80 text-white', buttonText: 'Listen', size: CardSize.Medium },
    'music-soundcloud': { icon: 'music', colorClass: 'bg-[#FF5500]/80 text-white', buttonText: 'Listen', size: CardSize.Medium },
    'blog-rss': { icon: 'book', colorClass: 'bg-orange-500/80 text-white', buttonText: '', size: CardSize.Medium },
    'contact-email': { icon: 'mail', colorClass: 'bg-blue-500/80 text-white', buttonText: 'Email Me', size: CardSize.Small },
    'contact-phone': { icon: 'phone', colorClass: 'bg-green-500/80 text-white', buttonText: 'Call Me', size: CardSize.Small },
    'contact-qq': { icon: 'qq', colorClass: 'bg-[#12B7F5]/80 text-white', buttonText: 'Add QQ', size: CardSize.Small },
    'contact-wechat': { icon: 'wechat', colorClass: 'bg-[#07C160]/80 text-white', buttonText: 'Add WeChat', size: CardSize.Small },
    'contact-telegram': { icon: 'telegram', colorClass: 'bg-[#0088cc]/80 text-white', buttonText: 'Message', size: CardSize.Small },
};

const CardEditorModal: React.FC<CardEditorModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData }) => {
    const [isLoadingGitHub, setIsLoadingGitHub] = useState(false);
    const [githubError, setGithubError] = useState<string | null>(null);
    const [isLoadingMastodon, setIsLoadingMastodon] = useState(false);
    const [mastodonError, setMastodonError] = useState<string | null>(null);
    const [showCustomColor, setShowCustomColor] = useState(false);
    const [customBgColor, setCustomBgColor] = useState('#3b82f6');
    const [customTextColor, setCustomTextColor] = useState('#ffffff');
    const [iconSearch, setIconSearch] = useState('');
    const [iconCategory, setIconCategory] = useState<string>('all');
    const [formData, setFormData] = useState<Partial<BentoCardProps>>({
        title: '',
        subtitle: '',
        buttonText: '',
        url: '',
        type: 'link',
        size: CardSize.Small,
        colorClass: 'bg-white',
        icon: 'link',
    });

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Ensure all required fields are present
                setFormData({
                    ...initialData,
                    type: initialData.type || 'link',
                    size: initialData.size || CardSize.Small,
                    colorClass: initialData.colorClass || 'bg-gray-100/80',
                    title: initialData.title || '',
                    subtitle: initialData.subtitle || '',
                    buttonText: initialData.buttonText || '',
                    url: initialData.url || '',
                    icon: initialData.icon || 'link',
                });
            } else {
                setFormData({
                    id: crypto.randomUUID(),
                    title: '',
                    subtitle: '',
                    buttonText: 'Visit',
                    url: '',
                    type: 'link',
                    size: CardSize.Small,
                    colorClass: 'bg-gray-100/80',
                    icon: 'link',
                    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop'
                });
            }
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleTypeChange = (newType: CardType) => {
        const preset = TYPE_PRESETS[newType];
        setFormData(prev => ({
            ...prev,
            type: newType,
            // Merge preset values if they exist, otherwise keep current or default
            icon: preset?.icon || (newType === 'link' ? 'link' : prev.icon),
            colorClass: preset?.colorClass || prev.colorClass,
            buttonText: preset?.buttonText !== undefined ? preset.buttonText : prev.buttonText,
        }));
    };

    const fetchGitHubData = async (path: string) => {
        if (!path) return;
        
        setIsLoadingGitHub(true);
        setGithubError(null);

        try {
            const response = await fetch(`/api/github?path=${encodeURIComponent(path)}`);
            const data = await response.json();

            if (!response.ok) {
                setGithubError(data.error || 'Failed to fetch GitHub data');
                return;
            }

            // Update form with GitHub data
            if (data.type === 'user') {
                setFormData(prev => ({
                    ...prev,
                    title: data.name || data.login,
                    subtitle: data.bio || `${data.followers} followers · ${data.publicRepos} repos`,
                    url: data.url,
                    githubData: data,
                }));
            } else if (data.type === 'repo') {
                setFormData(prev => ({
                    ...prev,
                    title: data.name,
                    subtitle: data.description || `⭐ ${data.stars} · 🍴 ${data.forks}${data.language ? ` · ${data.language}` : ''}`,
                    url: data.url,
                    githubData: data,
                }));
            }
        } catch (error) {
            console.error('GitHub fetch error:', error);
            setGithubError('Failed to fetch GitHub data');
        } finally {
            setIsLoadingGitHub(false);
        }
    };

    const fetchMastodonData = async (input: string) => {
        if (!input) return;
        
        setIsLoadingMastodon(true);
        setMastodonError(null);

        try {
            const response = await fetch(`/api/mastodon?input=${encodeURIComponent(input)}`);
            const data = await response.json();

            if (!response.ok) {
                setMastodonError(data.error || 'Failed to fetch Mastodon data');
                return;
            }

            // Update form with Mastodon data
            setFormData(prev => ({
                ...prev,
                title: prev.title || data.name,
                subtitle: data.description?.replace('Public posts from ', '') || '',
                url: input,
                mastodonData: data,
            }));
        } catch (error) {
            console.error('Mastodon fetch error:', error);
            setMastodonError('Failed to fetch Mastodon data');
        } finally {
            setIsLoadingMastodon(false);
        }
    };

    const handleGitHubUrlChange = (value: string) => {
        setFormData({ ...formData, url: value });
        setGithubError(null);
        
        // Auto-fetch when user stops typing (debounce)
        if (formData.type === 'social-github' && value) {
            const timeoutId = setTimeout(() => {
                fetchGitHubData(value);
            }, 800);
            return () => clearTimeout(timeoutId);
        }
    };

    const handleMastodonInputChange = (value: string) => {
        setFormData({ ...formData, url: value });
        setMastodonError(null);
        
        // Auto-fetch when user stops typing (debounce)
        if (formData.type === 'social-mastodon' && value) {
            const timeoutId = setTimeout(() => {
                fetchMastodonData(value);
            }, 800);
            return () => clearTimeout(timeoutId);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Clean up data
        const cleanData = { ...formData };
        if (cleanData.type !== 'image' && cleanData.type !== 'image-link') {
            delete cleanData.imageUrl;
        }
        // Clean up contact info for non-contact cards
        if (!cleanData.type?.startsWith('contact-')) {
            delete cleanData.contactInfo;
        }
        // Clean up url for contact cards (they use contactInfo instead)
        if (cleanData.type?.startsWith('contact-')) {
            delete cleanData.url;
        }
        onSave(cleanData as BentoCardProps);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {initialData ? <RiLayoutGridFill size={20} className="text-blue-500" /> : <RiLayoutGridFill size={20} className="text-green-500" />}
                        {initialData ? 'Edit Card' : 'New Card'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <RiCloseLine size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">

                    {/* Section 1: Type & Size */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <Label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Card Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => handleTypeChange(value as CardType)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Basic</SelectLabel>
                                        <SelectItem value="link">Standard Link</SelectItem>
                                        <SelectItem value="image">Image Only</SelectItem>
                                        <SelectItem value="image-link">Image with Link</SelectItem>
                                    </SelectGroup>
                                    <SelectGroup>
                                        <SelectLabel>Social</SelectLabel>
                                        <SelectItem value="social-x">X / Twitter</SelectItem>
                                        <SelectItem value="social-insta">Instagram</SelectItem>
                                        <SelectItem value="social-github">GitHub</SelectItem>
                                        <SelectItem value="social-youtube">YouTube</SelectItem>
                                        <SelectItem value="social-linkedin">LinkedIn</SelectItem>
                                        <SelectItem value="social-mastodon">Mastodon</SelectItem>
                                    </SelectGroup>
                                    <SelectGroup>
                                        <SelectLabel>Media</SelectLabel>
                                        <SelectItem value="video-youtube">YouTube Video</SelectItem>
                                        <SelectItem value="video-vimeo">Vimeo Video</SelectItem>
                                        <SelectItem value="music-spotify">Spotify Track</SelectItem>
                                        <SelectItem value="music-soundcloud">SoundCloud</SelectItem>
                                    </SelectGroup>
                                    <SelectGroup>
                                        <SelectLabel>Content</SelectLabel>
                                        <SelectItem value="blog-rss">Blog RSS Feed</SelectItem>
                                    </SelectGroup>
                                    <SelectGroup>
                                        <SelectLabel>Contact (Protected)</SelectLabel>
                                        <SelectItem value="contact-email">Email</SelectItem>
                                        <SelectItem value="contact-phone">Phone</SelectItem>
                                        <SelectItem value="contact-qq">QQ</SelectItem>
                                        <SelectItem value="contact-wechat">WeChat</SelectItem>
                                        <SelectItem value="contact-telegram">Telegram</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <RiInformationFill size={14} className="text-blue-500" />
                                Icon will appear in the top-right corner
                            </p>
                        </div>

                        <div>
                            <Label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Size</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { s: CardSize.Small, label: '1x1', h: 'h-8' },
                                    { s: CardSize.Medium, label: '2x1', h: 'h-8' },
                                    { s: CardSize.Tall, label: '1x2', h: 'h-12' },
                                    { s: CardSize.Large, label: '2x2', h: 'h-12' },
                                ].map((opt) => (
                                    <label
                                        key={opt.s}
                                        className={`
                      cursor-pointer border rounded-lg flex flex-col items-center justify-center gap-1 transition-all p-2
                      ${formData.size === opt.s
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }
                    `}
                                    >
                                        <input type="radio" name="size" className="hidden" checked={formData.size === opt.s} onChange={() => setFormData({ ...formData, size: opt.s })} />
                                        <div className={`w-full bg-current rounded-sm opacity-40 ${opt.h}`}></div>
                                        <span className="text-[10px] font-bold">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Section 2: Content */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-baseline">
                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Content</Label>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {(formData.type === 'image' || formData.type === 'image-link') ? (
                                <ImageUpload
                                    value={formData.imageUrl || ''}
                                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                                    folder="cards"
                                    placeholder="Image URL or upload (max 5MB)"
                                />
                            ) : null}

                            {/* Help text for embed types */}
                            {formData.type === 'video-youtube' && (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <RiInformationFill size={14} className="text-blue-500 flex-shrink-0" />
                                    Paste YouTube video URL (e.g., https://youtube.com/watch?v=...)
                                </p>
                            )}
                            {formData.type === 'video-vimeo' && (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <RiInformationFill size={14} className="text-blue-500 flex-shrink-0" />
                                    Paste Vimeo video URL (e.g., https://vimeo.com/123456789)
                                </p>
                            )}
                            {formData.type === 'music-spotify' && (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <RiInformationFill size={14} className="text-blue-500 flex-shrink-0" />
                                    Paste Spotify track URL (e.g., https://open.spotify.com/track/...)
                                </p>
                            )}
                            {formData.type === 'music-soundcloud' && (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <RiInformationFill size={14} className="text-blue-500 flex-shrink-0" />
                                    Paste SoundCloud track URL
                                </p>
                            )}
                            {formData.type === 'social-github' && (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <RiInformationFill size={14} className="text-blue-500 flex-shrink-0" />
                                    Enter username (e.g., "octocat") or username/repo (e.g., "facebook/react")
                                </p>
                            )}
                            {formData.type === 'social-mastodon' && (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <RiInformationFill size={14} className="text-blue-500 flex-shrink-0" />
                                    Enter @username@instance.com or profile URL (e.g., "@system@imsb.app" or "https://imsb.app/@system")
                                </p>
                            )}
                            {formData.type === 'blog-rss' && (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <RiInformationFill size={14} className="text-blue-500 flex-shrink-0" />
                                    Enter your blog RSS feed URL (e.g., "https://yourblog.com/rss")
                                </p>
                            )}
                            {formData.type?.startsWith('contact-') && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-xs text-yellow-800 font-medium flex items-center gap-1.5">
                                        <RiShieldCheckFill size={14} className="text-yellow-600 flex-shrink-0" />
                                        Your contact info will be encoded and protected from web crawlers
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <Input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Title (e.g. My Blog)"
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <Input
                                        type="text"
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                        placeholder="Subtitle (Optional)"
                                    />
                                </div>
                            </div>

                            {formData.type === 'social-github' ? (
                                <div className="space-y-2">
                                    <Input
                                        type="text"
                                        value={formData.url}
                                        onChange={(e) => handleGitHubUrlChange(e.target.value)}
                                        className="font-mono text-sm"
                                        placeholder="username or username/repo"
                                    />
                                    {isLoadingGitHub && (
                                        <p className="text-xs text-blue-500 flex items-center gap-1">
                                            <RiRefreshFill size={14} className="animate-spin" />
                                            Fetching GitHub data...
                                        </p>
                                    )}
                                    {githubError && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <RiCloseCircleFill size={14} />
                                            {githubError}
                                        </p>
                                    )}
                                    {formData.githubData && (
                                        <p className="text-xs text-green-500 flex items-center gap-1">
                                            <RiCheckboxCircleFill size={14} />
                                            GitHub data loaded
                                        </p>
                                    )}
                                </div>
                            ) : formData.type === 'social-mastodon' ? (
                                <div className="space-y-2">
                                    <Input
                                        type="text"
                                        value={formData.url}
                                        onChange={(e) => handleMastodonInputChange(e.target.value)}
                                        className="font-mono text-sm"
                                        placeholder="@username@instance.com or profile URL"
                                    />
                                    {isLoadingMastodon && (
                                        <p className="text-xs text-blue-500 flex items-center gap-1">
                                            <RiRefreshFill size={14} className="animate-spin" />
                                            Fetching Mastodon data...
                                        </p>
                                    )}
                                    {mastodonError && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <RiCloseCircleFill size={14} />
                                            {mastodonError}
                                        </p>
                                    )}
                                    {formData.mastodonData && (
                                        <p className="text-xs text-green-500 flex items-center gap-1">
                                            <RiCheckboxCircleFill size={14} />
                                            Mastodon data loaded
                                        </p>
                                    )}
                                </div>
                            ) : formData.type?.startsWith('contact-') ? (
                                <div className="space-y-2">
                                    <Input
                                        type="text"
                                        value={formData.contactInfo ? atob(formData.contactInfo) : ''}
                                        onChange={(e) => {
                                            // Encode contact info to base64
                                            const encoded = btoa(e.target.value);
                                            setFormData({ ...formData, contactInfo: encoded });
                                        }}
                                        className="font-mono text-sm"
                                        placeholder={
                                            formData.type === 'contact-email' ? 'your@email.com' :
                                            formData.type === 'contact-phone' ? '+1234567890' :
                                            formData.type === 'contact-qq' ? 'QQ Number' :
                                            formData.type === 'contact-wechat' ? 'WeChat ID' :
                                            formData.type === 'contact-telegram' ? 'Telegram Username' :
                                            'Contact Info'
                                        }
                                    />
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        {formData.type === 'contact-email' && (
                                            <>
                                                <RiMailFill size={14} className="text-blue-500 flex-shrink-0" />
                                                Enter your email address
                                            </>
                                        )}
                                        {formData.type === 'contact-phone' && (
                                            <>
                                                <RiPhoneFill size={14} className="text-green-500 flex-shrink-0" />
                                                Enter your phone number with country code
                                            </>
                                        )}
                                        {formData.type === 'contact-qq' && (
                                            <>
                                                <RiQqFill size={14} className="text-blue-400 flex-shrink-0" />
                                                Enter your QQ number
                                            </>
                                        )}
                                        {formData.type === 'contact-wechat' && (
                                            <>
                                                <RiWechatFill size={14} className="text-green-500 flex-shrink-0" />
                                                Enter your WeChat ID
                                            </>
                                        )}
                                        {formData.type === 'contact-telegram' && (
                                            <>
                                                <RiTelegramFill size={14} className="text-blue-500 flex-shrink-0" />
                                                Enter your Telegram username (without @)
                                            </>
                                        )}
                                    </p>
                                </div>
                            ) : formData.type !== 'image' && (
                                <Input
                                    type="url"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    className="font-mono text-sm"
                                    placeholder="URL (https://example.com)"
                                />
                            )}

                            {/* Link URL for Image-Link type */}
                            {formData.type === 'image-link' && (
                                <Input
                                    type="url"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    className="font-mono text-sm"
                                    placeholder="Link Destination URL"
                                />
                            )}

                            {formData.type !== 'image' && (
                                <Input
                                    type="text"
                                    value={formData.buttonText}
                                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                                    placeholder="Button Text (e.g. Follow)"
                                />
                            )}
                        </div>
                    </div>

                    {/* Section 3: Visuals (Only for non-image cards) */}
                    {formData.type !== 'image' && formData.type !== 'image-link' && (
                        <>
                            <hr className="border-gray-100" />
                            <div>
                                <Label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Appearance</Label>

                                <div className="space-y-4">
                                    {/* Colors */}
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-semibold text-gray-700">Color Scheme</span>
                                            <button
                                                type="button"
                                                onClick={() => setShowCustomColor(!showCustomColor)}
                                                className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                            >
                                                {showCustomColor ? (
                                                    <>
                                                        <RiArrowLeftLine size={14} className="inline" />
                                                        {' '}Back to Presets
                                                    </>
                                                ) : (
                                                    <>
                                                        <RiPaletteFill size={14} className="inline" />
                                                        {' '}Custom Color
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        
                                        {!showCustomColor ? (
                                            <div className="space-y-3">
                                                {/* Brand Colors */}
                                                <div>
                                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Brand</div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {COLORS.filter(c => c.category === 'brand').map((c) => (
                                                            <button
                                                                key={c.name}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData({ ...formData, colorClass: c.class });
                                                                }}
                                                                className={`
                                                                    w-8 h-8 rounded-lg shadow-sm transition-all hover:scale-110
                                                                    ${formData.colorClass === c.class ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''}
                                                                `}
                                                                style={{ backgroundColor: c.bg + 'CC' }}
                                                                title={c.name}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Vibrant Colors */}
                                                <div>
                                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Vibrant</div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {COLORS.filter(c => c.category === 'vibrant').map((c) => (
                                                            <button
                                                                key={c.name}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData({ ...formData, colorClass: c.class });
                                                                }}
                                                                className={`
                                                                    w-8 h-8 rounded-lg shadow-sm transition-all hover:scale-110
                                                                    ${formData.colorClass === c.class ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''}
                                                                `}
                                                                style={{ backgroundColor: c.bg + 'CC' }}
                                                                title={c.name}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Pastel Colors */}
                                                <div>
                                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Pastel</div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {COLORS.filter(c => c.category === 'pastel').map((c) => (
                                                            <button
                                                                key={c.name}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData({ ...formData, colorClass: c.class });
                                                                }}
                                                                className={`
                                                                    w-8 h-8 rounded-lg shadow-sm transition-all hover:scale-110 border border-gray-200
                                                                    ${formData.colorClass === c.class ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''}
                                                                `}
                                                                style={{ backgroundColor: c.bg + 'CC' }}
                                                                title={c.name}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Dark Colors */}
                                                <div>
                                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Dark</div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {COLORS.filter(c => c.category === 'dark').map((c) => (
                                                            <button
                                                                key={c.name}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData({ ...formData, colorClass: c.class });
                                                                }}
                                                                className={`
                                                                    w-8 h-8 rounded-lg shadow-sm transition-all hover:scale-110
                                                                    ${formData.colorClass === c.class ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''}
                                                                `}
                                                                style={{ backgroundColor: c.bg + 'CC' }}
                                                                title={c.name}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Neutral & Gradient */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Neutral</div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {COLORS.filter(c => c.category === 'neutral').map((c) => (
                                                                <button
                                                                    key={c.name}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFormData({ ...formData, colorClass: c.class });
                                                                    }}
                                                                    className={`
                                                                        w-8 h-8 rounded-lg shadow-sm transition-all hover:scale-110
                                                                        ${c.class.includes('bg-white') || c.class.includes('bg-gray-100') ? 'border border-gray-300' : ''} 
                                                                        ${formData.colorClass === c.class ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''}
                                                                    `}
                                                                    style={{ backgroundColor: c.bg + 'CC' }}
                                                                    title={c.name}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Gradient</div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {COLORS.filter(c => c.category === 'gradient').map((c) => (
                                                                <button
                                                                    key={c.name}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFormData({ ...formData, colorClass: c.class });
                                                                    }}
                                                                    className={`
                                                                        w-8 h-8 rounded-lg shadow-sm transition-all hover:scale-110 ${c.class}
                                                                        ${formData.colorClass === c.class ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''}
                                                                    `}
                                                                    title={c.name}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Custom Color Picker */
                                            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl space-y-4 border border-gray-200">
                                                <div className="space-y-3">
                                                    <div>
                                                        <Label className="text-xs font-semibold mb-2 block">Background Color</Label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="color"
                                                                value={customBgColor}
                                                                onChange={(e) => setCustomBgColor(e.target.value)}
                                                                className="w-14 h-10 rounded-lg cursor-pointer border-2 border-gray-300"
                                                            />
                                                            <Input
                                                                value={customBgColor}
                                                                onChange={(e) => setCustomBgColor(e.target.value)}
                                                                className="flex-1 font-mono text-sm"
                                                                placeholder="#3b82f6"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs font-semibold mb-2 block">Text & Icon Color</Label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="color"
                                                                value={customTextColor}
                                                                onChange={(e) => setCustomTextColor(e.target.value)}
                                                                className="w-14 h-10 rounded-lg cursor-pointer border-2 border-gray-300"
                                                            />
                                                            <Input
                                                                value={customTextColor}
                                                                onChange={(e) => setCustomTextColor(e.target.value)}
                                                                className="flex-1 font-mono text-sm"
                                                                placeholder="#ffffff"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Preview */}
                                                <div 
                                                    className="p-4 rounded-lg text-center font-semibold transition-all"
                                                    style={{ 
                                                        backgroundColor: customBgColor + 'CC',
                                                        color: customTextColor 
                                                    }}
                                                >
                                                    Preview
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const customClass = `bg-[${customBgColor}]/80 text-[${customTextColor}]`;
                                                        setFormData({ ...formData, colorClass: customClass });
                                                        setShowCustomColor(false);
                                                    }}
                                                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
                                                >
                                                    ✓ Apply Custom Color
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Icons */}
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-semibold text-gray-700">Icon (optional)</span>
                                            {formData.icon && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, icon: undefined })}
                                                    className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                                                >
                                                    ✕ Remove Icon
                                                </button>
                                            )}
                                        </div>

                                        {/* Icon Search & Filter */}
                                        <div className="space-y-2 mb-3">
                                            <Input
                                                type="text"
                                                value={iconSearch}
                                                onChange={(e) => setIconSearch(e.target.value)}
                                                placeholder="🔍 Search icons..."
                                                className="text-sm"
                                            />
                                            <div className="flex gap-1 flex-wrap">
                                                {['all', 'social', 'common', 'content', 'media', 'tech', 'business', 'ui', 'nature'].map((cat) => (
                                                    <button
                                                        key={cat}
                                                        type="button"
                                                        onClick={() => setIconCategory(cat)}
                                                        className={`
                                                            px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all
                                                            ${iconCategory === cat 
                                                                ? 'bg-blue-600 text-white shadow-sm' 
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                            }
                                                        `}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 max-h-64 overflow-y-auto">
                                            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
                                                {Object.keys(ICON_MAP)
                                                    .filter((iconKey) => {
                                                        // Search filter
                                                        if (iconSearch && !iconKey.toLowerCase().includes(iconSearch.toLowerCase())) {
                                                            return false;
                                                        }
                                                        // Category filter
                                                        if (iconCategory === 'all') return true;
                                                        return ICON_CATEGORIES[iconCategory]?.includes(iconKey) || false;
                                                    })
                                                    .map((iconKey) => {
                                                        const IconComp = ICON_MAP[iconKey];
                                                        return (
                                                            <button
                                                                key={iconKey}
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, icon: iconKey })}
                                                                className={`
                                                                    aspect-square rounded-lg flex items-center justify-center transition-all
                                                                    ${formData.icon === iconKey 
                                                                        ? 'bg-white shadow-md text-blue-600 ring-2 ring-blue-500 scale-110' 
                                                                        : 'text-gray-400 hover:bg-white hover:text-gray-700 hover:scale-105'
                                                                    }
                                                                `}
                                                                title={iconKey}
                                                            >
                                                                <IconComp size={16} />
                                                            </button>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                            <RiInformationFill size={14} className="text-blue-500 flex-shrink-0" />
                                            {Object.keys(ICON_MAP).filter((iconKey) => {
                                                if (iconSearch && !iconKey.toLowerCase().includes(iconSearch.toLowerCase())) return false;
                                                if (iconCategory === 'all') return true;
                                                return ICON_CATEGORIES[iconCategory]?.includes(iconKey) || false;
                                            }).length} icons {iconSearch || iconCategory !== 'all' ? 'found' : 'available'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-2 flex gap-3 sticky bottom-0 bg-white pb-2 border-t border-gray-100 mt-6">
                        <Button
                            type="submit"
                            className="flex-1"
                        >
                            Save Changes
                        </Button>
                        {initialData && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => onDelete(initialData.id)}
                                title="Delete Card"
                            >
                                <RiDeleteBinLine size={20} />
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CardEditorModal;
