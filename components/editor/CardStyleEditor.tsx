'use client';

import React, { useState } from 'react';
import { BentoCardProps } from '@/lib/types';
import { ICON_MAP } from '@/components/bento/BentoCard';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RiSearchLine, RiCloseLine } from '@remixicon/react';

interface CardStyleEditorProps {
    formData: Partial<BentoCardProps>;
    onChange: (updates: Partial<BentoCardProps>) => void;
}

const PRESET_COLORS = [
    // 品牌色
    { name: 'Twitter', class: 'bg-[#1DA1F2]/80 text-white', category: 'brand' },
    { name: 'GitHub', class: 'bg-[#2dba4e]/80 text-white', category: 'brand' },
    { name: 'YouTube', class: 'bg-[#FF0000]/80 text-white', category: 'brand' },
    { name: 'LinkedIn', class: 'bg-[#0A66C2]/80 text-white', category: 'brand' },
    { name: 'Instagram', class: 'bg-[#E4405F]/80 text-white', category: 'brand' },
    { name: 'Spotify', class: 'bg-[#1DB954]/80 text-white', category: 'brand' },
    
    // 常用色
    { name: '蓝色', class: 'bg-blue-500/80 text-white', category: 'common' },
    { name: '紫色', class: 'bg-purple-500/80 text-white', category: 'common' },
    { name: '粉色', class: 'bg-pink-500/80 text-white', category: 'common' },
    { name: '红色', class: 'bg-red-500/80 text-white', category: 'common' },
    { name: '橙色', class: 'bg-orange-500/80 text-white', category: 'common' },
    { name: '黄色', class: 'bg-yellow-400/80 text-black', category: 'common' },
    { name: '绿色', class: 'bg-green-500/80 text-white', category: 'common' },
    { name: '青色', class: 'bg-cyan-500/80 text-white', category: 'common' },
    
    // 中性色
    { name: '白色', class: 'bg-white/80 text-black', category: 'neutral' },
    { name: '浅灰', class: 'bg-gray-100/80 text-black', category: 'neutral' },
    { name: '灰色', class: 'bg-gray-400/80 text-white', category: 'neutral' },
    { name: '深灰', class: 'bg-gray-700/80 text-white', category: 'neutral' },
    { name: '黑色', class: 'bg-gray-900/80 text-white', category: 'neutral' },
    
    // 渐变色
    { name: '日落', class: 'bg-gradient-to-r from-orange-500 to-pink-500 text-white', category: 'gradient' },
    { name: '海洋', class: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white', category: 'gradient' },
    { name: '森林', class: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white', category: 'gradient' },
    { name: '紫霞', class: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white', category: 'gradient' },
];

const ICON_CATEGORIES = {
    social: ['twitter', 'instagram', 'github', 'youtube', 'linkedin', 'mastodon', 'spotify', 'soundcloud', 'discord', 'twitch', 'tiktok', 'pinterest', 'reddit', 'whatsapp', 'telegram', 'wechat', 'qq'],
    common: ['link', 'mail', 'phone', 'message', 'heart', 'star', 'bookmark', 'home', 'user'],
    media: ['image', 'video', 'music', 'camera', 'film', 'headphone'],
    business: ['briefcase', 'shopping', 'cart', 'wallet', 'gift'],
    tech: ['code', 'terminal', 'database', 'server', 'computer'],
};

const CardStyleEditor: React.FC<CardStyleEditorProps> = ({ formData, onChange }) => {
    const [iconSearch, setIconSearch] = useState('');
    const [iconCategory, setIconCategory] = useState<string>('all');

    // 图片类型不需要样式编辑
    if (formData.type === 'image' || formData.type === 'image-link') {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>图片卡片不需要设置颜色和图标</p>
            </div>
        );
    }

    const filteredIcons = Object.keys(ICON_MAP).filter((iconKey) => {
        if (iconSearch && !iconKey.toLowerCase().includes(iconSearch.toLowerCase())) {
            return false;
        }
        if (iconCategory === 'all') return true;
        return ICON_CATEGORIES[iconCategory as keyof typeof ICON_CATEGORIES]?.includes(iconKey) || false;
    });

    return (
        <div className="space-y-6">
            {/* 颜色选择 */}
            <div>
                <Label className="text-sm font-semibold mb-3 block">卡片颜色</Label>
                
                <div className="space-y-3">
                    {['brand', 'common', 'neutral', 'gradient'].map((category) => {
                        const colors = PRESET_COLORS.filter(c => c.category === category);
                        const categoryNames = {
                            brand: '品牌色',
                            common: '常用色',
                            neutral: '中性色',
                            gradient: '渐变色',
                        };
                        
                        return (
                            <div key={category}>
                                <div className="text-xs font-medium text-gray-500 mb-2">
                                    {categoryNames[category as keyof typeof categoryNames]}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {colors.map((color) => {
                                        const isSelected = formData.colorClass === color.class;
                                        
                                        return (
                                            <button
                                                key={color.name}
                                                type="button"
                                                onClick={() => onChange({ colorClass: color.class })}
                                                className={`
                                                    group relative w-12 h-12 rounded-lg transition-all
                                                    ${color.class}
                                                    ${isSelected 
                                                        ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' 
                                                        : 'hover:scale-105'
                                                    }
                                                `}
                                                title={color.name}
                                            >
                                                {isSelected && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-3 h-3 bg-white rounded-full" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 图标选择 */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <Label className="text-sm font-semibold">卡片图标（可选）</Label>
                    {formData.icon && (
                        <button
                            type="button"
                            onClick={() => onChange({ icon: undefined })}
                            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                            <RiCloseLine size={14} />
                            移除图标
                        </button>
                    )}
                </div>

                {/* 搜索和分类 */}
                <div className="space-y-2 mb-3">
                    <div className="relative">
                        <RiSearchLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            value={iconSearch}
                            onChange={(e) => setIconSearch(e.target.value)}
                            placeholder="搜索图标..."
                            className="pl-9"
                        />
                    </div>
                    
                    <div className="flex gap-1 flex-wrap">
                        {['all', 'social', 'common', 'media', 'business', 'tech'].map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setIconCategory(cat)}
                                className={`
                                    px-3 py-1 rounded-md text-xs font-medium transition-all
                                    ${iconCategory === cat 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }
                                `}
                            >
                                {cat === 'all' ? '全部' : cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 图标网格 */}
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-8 gap-1">
                        {filteredIcons.map((iconKey) => {
                            const IconComp = ICON_MAP[iconKey];
                            const isSelected = formData.icon === iconKey;
                            
                            return (
                                <button
                                    key={iconKey}
                                    type="button"
                                    onClick={() => onChange({ icon: iconKey })}
                                    className={`
                                        aspect-square rounded-lg flex items-center justify-center transition-all
                                        ${isSelected 
                                            ? 'bg-blue-500 text-white shadow-md scale-110' 
                                            : 'text-gray-400 hover:bg-white hover:text-gray-700 hover:scale-105'
                                        }
                                    `}
                                    title={iconKey}
                                >
                                    <IconComp size={18} />
                                </button>
                            );
                        })}
                    </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                    找到 {filteredIcons.length} 个图标
                </p>
            </div>
        </div>
    );
};

export default CardStyleEditor;
