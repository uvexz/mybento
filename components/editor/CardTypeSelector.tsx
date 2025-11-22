'use client';

import React from 'react';
import { CardSize, CardType } from '@/lib/types';
import { 
    RiLink, 
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
} from '@remixicon/react';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';

interface CardTypeSelectorProps {
    value: CardType;
    size: CardSize;
    onChange: (type: CardType, size?: CardSize) => void;
}

const getCardTypes = (t: any) => [
    {
        category: t('cardEditor.categories.basic'),
        types: [
            { value: 'link', label: t('cardEditor.types.link'), icon: RiLink, size: CardSize.Small },
            { value: 'image', label: t('cardEditor.types.image'), icon: RiImage2Line, size: CardSize.Medium },
            { value: 'image-link', label: t('cardEditor.types.imageLink'), icon: RiImage2Line, size: CardSize.Medium },
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
            { value: 'music-spotify', label: t('cardEditor.types.musicSpotify'), icon: RiMusicLine, size: CardSize.Medium },
            { value: 'music-soundcloud', label: t('cardEditor.types.musicSoundcloud'), icon: RiMusicLine, size: CardSize.Medium },
            { value: 'blog-rss', label: t('cardEditor.types.blogRss'), icon: RiRssLine, size: CardSize.Medium },
            { value: 'article', label: t('cardEditor.types.article'), icon: RiArticleLine, size: CardSize.Medium },
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

const CardTypeSelector: React.FC<CardTypeSelectorProps> = ({ value, size, onChange }) => {
    const t = useTranslations();
    const CARD_TYPES = getCardTypes(t);
    const SIZE_OPTIONS = getSizeOptions(t);
    
    return (
        <div className="space-y-6">
            {/* 卡片类型选择 */}
            <div>
                <Label className="text-sm font-semibold mb-3 block">{t('cardEditor.selectCardType')}</Label>
                <div className="space-y-4">
                    {CARD_TYPES.map((category) => (
                        <div key={category.category}>
                            <h4 className="text-xs font-medium text-gray-500 mb-2">{category.category}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {category.types.map((type) => {
                                    const Icon = type.icon;
                                    const isSelected = value === type.value;
                                    
                                    return (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => onChange(type.value as CardType, type.size)}
                                            className={`
                                                p-3 rounded-lg border-2 transition-all text-left
                                                flex items-center gap-3
                                                ${isSelected 
                                                    ? 'border-blue-500 bg-blue-50 shadow-sm' 
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            <div className={`
                                                w-10 h-10 rounded-lg flex items-center justify-center
                                                ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}
                                            `}>
                                                <Icon size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                                    {type.label}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 卡片尺寸选择 */}
            <div>
                <Label className="text-sm font-semibold mb-3 block">{t('editor.cardSize')}</Label>
                <div className="grid grid-cols-2 gap-3">
                    {SIZE_OPTIONS.map((option) => {
                        const isSelected = size === option.value;
                        
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onChange(value, option.value)}
                                className={`
                                    p-4 rounded-lg border-2 transition-all
                                    flex flex-col items-center gap-2
                                    ${isSelected 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <div className={`
                                    ${option.width} ${option.height} rounded border-2 transition-all
                                    ${isSelected ? 'border-blue-500 bg-blue-100' : 'border-gray-300 bg-gray-100'}
                                `} />
                                <span className={`text-xs font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CardTypeSelector;
