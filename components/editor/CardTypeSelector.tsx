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
    RiMailLine,
    RiPhoneLine,
    RiQqLine,
    RiWechatLine,
    RiTelegramLine,
} from '@remixicon/react';
import { Label } from '@/components/ui/label';

interface CardTypeSelectorProps {
    value: CardType;
    size: CardSize;
    onChange: (type: CardType, size?: CardSize) => void;
}

const CARD_TYPES = [
    {
        category: '基础',
        types: [
            { value: 'link', label: '标准链接', icon: RiLink, size: CardSize.Small },
            { value: 'image', label: '纯图片', icon: RiImage2Line, size: CardSize.Medium },
            { value: 'image-link', label: '图片链接', icon: RiImage2Line, size: CardSize.Medium },
        ]
    },
    {
        category: '社交媒体',
        types: [
            { value: 'social-x', label: 'X / Twitter', icon: RiTwitterXLine, size: CardSize.Small },
            { value: 'social-insta', label: 'Instagram', icon: RiInstagramLine, size: CardSize.Small },
            { value: 'social-github', label: 'GitHub', icon: RiGithubLine, size: CardSize.Small },
            { value: 'social-youtube', label: 'YouTube', icon: RiYoutubeLine, size: CardSize.Small },
            { value: 'social-linkedin', label: 'LinkedIn', icon: RiLinkedinLine, size: CardSize.Small },
            { value: 'social-mastodon', label: 'Mastodon', icon: RiMastodonLine, size: CardSize.Medium },
        ]
    },
    {
        category: '媒体内容',
        types: [
            { value: 'video-youtube', label: 'YouTube 视频', icon: RiYoutubeLine, size: CardSize.Large },
            { value: 'video-vimeo', label: 'Vimeo 视频', icon: RiVideoLine, size: CardSize.Large },
            { value: 'music-spotify', label: 'Spotify', icon: RiMusicLine, size: CardSize.Medium },
            { value: 'music-soundcloud', label: 'SoundCloud', icon: RiMusicLine, size: CardSize.Medium },
            { value: 'blog-rss', label: 'Blog RSS', icon: RiRssLine, size: CardSize.Medium },
        ]
    },
    {
        category: '联系方式（加密保护）',
        types: [
            { value: 'contact-email', label: 'Email', icon: RiMailLine, size: CardSize.Small },
            { value: 'contact-phone', label: '电话', icon: RiPhoneLine, size: CardSize.Small },
            { value: 'contact-qq', label: 'QQ', icon: RiQqLine, size: CardSize.Small },
            { value: 'contact-wechat', label: '微信', icon: RiWechatLine, size: CardSize.Small },
            { value: 'contact-telegram', label: 'Telegram', icon: RiTelegramLine, size: CardSize.Small },
        ]
    },
];

const SIZE_OPTIONS = [
    { value: CardSize.Small, label: '小 (1×1)', width: 'w-12', height: 'h-12' },
    { value: CardSize.Medium, label: '中 (2×1)', width: 'w-24', height: 'h-12' },
    { value: CardSize.Tall, label: '高 (1×2)', width: 'w-12', height: 'h-24' },
    { value: CardSize.Large, label: '大 (2×2)', width: 'w-24', height: 'h-24' },
];

const CardTypeSelector: React.FC<CardTypeSelectorProps> = ({ value, size, onChange }) => {
    return (
        <div className="space-y-6">
            {/* 卡片类型选择 */}
            <div>
                <Label className="text-sm font-semibold mb-3 block">选择卡片类型</Label>
                <div className="space-y-4">
                    {CARD_TYPES.map((category) => (
                        <div key={category.category}>
                            <h4 className="text-xs font-medium text-gray-500 mb-2">{category.category}</h4>
                            <div className="grid grid-cols-2 gap-2">
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
                <Label className="text-sm font-semibold mb-3 block">卡片尺寸</Label>
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
