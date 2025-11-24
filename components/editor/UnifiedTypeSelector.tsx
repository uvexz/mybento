'use client';

import React from 'react';
import { CardSize, CardType } from '@/lib/types';
import { 
    RiLink, 
    RiText,
    RiImage2Line,
    RiTwitterXLine,
    RiInstagramLine,
    RiGithubLine,
    RiYoutubeLine,
    RiLinkedinLine,
    RiMastodonLine,
    RiVideoLine,
    RiMusicLine,
    RiRssLine,
    RiArticleLine,
    RiMailLine,
    RiPhoneLine,
    RiQqLine,
    RiWechatLine,
    RiTelegramLine,
    RiNetflixLine,
} from '@remixicon/react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';

interface UnifiedTypeSelectorProps {
    type: CardType;
    size: CardSize;
    onChange: (type: CardType, size?: CardSize) => void;
}

const getCardTypes = (t: any) => [
    {
        category: t('cardEditor.categories.basic'),
        types: [
            { value: 'universal', label: t('cardEditor.types.universal'), icon: RiLink, size: CardSize.Small },
            { value: 'highlights', label: t('cardEditor.types.highlights'), icon: RiText, size: CardSize.Medium },
            { value: 'article', label: t('cardEditor.types.article'), icon: RiArticleLine, size: CardSize.Medium },
        ]
    },
    {
        category: t('cardEditor.categories.social'),
        types: [
            { value: 'social-x', label: t('cardEditor.types.socialX'), icon: RiTwitterXLine, size: CardSize.Small },
            { value: 'social-insta', label: t('cardEditor.types.socialInsta'), icon: RiInstagramLine, size: CardSize.Small },
            { value: 'social-github', label: t('cardEditor.types.socialGithub'), icon: RiGithubLine, size: CardSize.Small },
            { value: 'social-youtube', label: t('cardEditor.types.socialYoutube'), icon: RiYoutubeLine, size: CardSize.Small },
            { value: 'social-linkedin', label: t('cardEditor.types.socialLinkedin'), icon: RiLinkedinLine, size: CardSize.Small },
            { value: 'social-mastodon', label: t('cardEditor.types.socialMastodon'), icon: RiMastodonLine, size: CardSize.Medium },
        ]
    },
    {
        category: t('cardEditor.categories.media'),
        types: [
            { value: 'video-youtube', label: t('cardEditor.types.videoYoutube'), icon: RiYoutubeLine, size: CardSize.Large },
            { value: 'video-vimeo', label: t('cardEditor.types.videoVimeo'), icon: RiVideoLine, size: CardSize.Large },
            { value: 'video-bilibili', label: t('cardEditor.types.videoBilibili'), icon: RiNetflixLine, size: CardSize.Large },
            { value: 'music-spotify', label: t('cardEditor.types.musicSpotify'), icon: RiMusicLine, size: CardSize.Medium },
            { value: 'music-soundcloud', label: t('cardEditor.types.musicSoundcloud'), icon: RiMusicLine, size: CardSize.Medium },
            { value: 'music-netease', label: t('cardEditor.types.musicNetease'), icon: RiMusicLine, size: CardSize.Medium },
            { value: 'blog-rss', label: t('cardEditor.types.blogRss'), icon: RiRssLine, size: CardSize.Medium },
        ]
    },
    {
        category: t('cardEditor.categories.contact'),
        types: [
            { value: 'contact-email', label: t('cardEditor.types.contactEmail'), icon: RiMailLine, size: CardSize.Small },
            { value: 'contact-phone', label: t('cardEditor.types.contactPhone'), icon: RiPhoneLine, size: CardSize.Small },
            { value: 'contact-qq', label: t('cardEditor.types.contactQQ'), icon: RiQqLine, size: CardSize.Small },
            { value: 'contact-wechat', label: t('cardEditor.types.contactWechat'), icon: RiWechatLine, size: CardSize.Small },
            { value: 'contact-telegram', label: t('cardEditor.types.contactTelegram'), icon: RiTelegramLine, size: CardSize.Small },
        ]
    },
];

const getSizeOptions = (t: any) => [
    { value: CardSize.Small, label: t('cardEditor.sizes.small'), width: 'w-12', height: 'h-12' },
    { value: CardSize.Medium, label: t('cardEditor.sizes.medium'), width: 'w-24', height: 'h-12' },
    { value: CardSize.Tall, label: t('cardEditor.sizes.tall'), width: 'w-12', height: 'h-24' },
    { value: CardSize.Large, label: t('cardEditor.sizes.large'), width: 'w-24', height: 'h-24' },
];

const UnifiedTypeSelector: React.FC<UnifiedTypeSelectorProps> = ({ type, size, onChange }) => {
    const t = useTranslations();
    const CARD_TYPES = getCardTypes(t);
    const SIZE_OPTIONS = getSizeOptions(t);
    
    // 获取当前选中类型的图标
    const getCurrentTypeIcon = () => {
        for (const category of CARD_TYPES) {
            const found = category.types.find(t => t.value === type);
            if (found) return found.icon;
        }
        return RiLink;
    };
    
    const CurrentIcon = getCurrentTypeIcon();
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card Type Selection */}
            <div>
                <Label className="text-sm font-medium mb-2 block">{t('editor.cardType')}</Label>
                <Select
                    value={type}
                    onValueChange={(value) => {
                        const cardType = value as CardType;
                        // 找到对应类型的默认尺寸
                        let defaultSize = size;
                        for (const category of CARD_TYPES) {
                            const found = category.types.find(t => t.value === cardType);
                            if (found) {
                                defaultSize = found.size;
                                break;
                            }
                        }
                        onChange(cardType, defaultSize);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue>
                            <div className="flex items-center gap-2">
                                <CurrentIcon size={16} />
                                <span>
                                    {CARD_TYPES.flatMap(c => c.types).find(t => t.value === type)?.label || type}
                                </span>
                            </div>
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {CARD_TYPES.map((category) => (
                            <div key={category.category}>
                                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                    {category.category}
                                </div>
                                {category.types.map((cardType) => {
                                    const Icon = cardType.icon;
                                    return (
                                        <SelectItem key={cardType.value} value={cardType.value}>
                                            <div className="flex items-center gap-2">
                                                <Icon size={16} />
                                                {cardType.label}
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </div>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Card Size Selection */}
            <div>
                <Label className="text-sm font-medium mb-2 block">{t('editor.cardSize')}</Label>
                <Select
                    value={size}
                    onValueChange={(value) => onChange(type, value as CardSize)}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue>
                            {SIZE_OPTIONS.find(s => s.value === size)?.label || size}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {SIZE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        ${option.width} ${option.height} rounded border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800
                                    `} />
                                    <span>{option.label}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};

export default UnifiedTypeSelector;
