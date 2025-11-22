'use client';

import React, { useState, useCallback } from 'react';
import { BentoCardProps } from '@/lib/types';
import { ICON_MAP } from '@/components/bento/BentoCard';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RiSearchLine, RiCloseLine } from '@remixicon/react';
import { useTranslations } from 'next-intl';
import ColorPicker from '@/components/ui/colorpicker';

interface CardStyleEditorProps {
    formData: Partial<BentoCardProps>;
    onChange: (updates: Partial<BentoCardProps>) => void;
}

const ICON_CATEGORIES = {
    social: ['twitter', 'instagram', 'github', 'youtube', 'linkedin', 'mastodon', 'spotify', 'soundcloud', 'discord', 'twitch', 'tiktok', 'pinterest', 'reddit', 'whatsapp', 'telegram', 'wechat', 'qq'],
    common: ['link', 'mail', 'phone', 'message', 'heart', 'star', 'bookmark', 'home', 'user'],
    media: ['image', 'video', 'music', 'camera', 'film', 'headphone'],
    business: ['briefcase', 'shopping', 'cart', 'wallet', 'gift'],
    tech: ['code', 'terminal', 'database', 'server', 'computer'],
};

const CardStyleEditor: React.FC<CardStyleEditorProps> = ({ formData, onChange }) => {
    const t = useTranslations();
    const [iconSearch, setIconSearch] = useState('');
    const [iconCategory, setIconCategory] = useState<string>('all');
    const [bgColor, setBgColor] = useState(formData.customBgColor || 'hsla(0, 0%, 95%, 0.8)');
    const [textColor, setTextColor] = useState(formData.customTextColor || 'hsla(0, 0%, 0%, 1)');

    // 当 formData.id 变化时（切换卡片），重置颜色状态
    React.useEffect(() => {
        setBgColor(formData.customBgColor || 'hsla(0, 0%, 95%, 0.8)');
        setTextColor(formData.customTextColor || 'hsla(0, 0%, 0%, 1)');
    }, [formData.id, formData.customBgColor, formData.customTextColor]);

    // 图片类型不需要样式编辑
    if (formData.type === 'image' || formData.type === 'image-link') {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>{t('cardEditor.noImageStyle')}</p>
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

    const handleBgColorChange = useCallback((color: string) => {
        setBgColor(color);
        // 更新 formData，使用自定义样式
        onChange({ 
            colorClass: 'custom-color',
            customBgColor: color,
            customTextColor: textColor
        });
    }, [textColor, onChange]);

    const handleTextColorChange = useCallback((color: string) => {
        setTextColor(color);
        // 更新 formData
        onChange({ 
            colorClass: 'custom-color',
            customBgColor: bgColor,
            customTextColor: color
        });
    }, [bgColor, onChange]);

    return (
        <div className="space-y-6">
            {/* 颜色选择 - 桌面并排，移动端堆叠 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 背景颜色选择 */}
                <div className="flex justify-center">
                    <ColorPicker 
                        key={`bg-${formData.id}`}
                        default_value={bgColor} 
                        onChange={handleBgColorChange}
                        label={t('cardEditor.backgroundColor')}
                    />
                </div>

                {/* 文字颜色选择 */}
                <div className="flex justify-center">
                    <ColorPicker 
                        key={`text-${formData.id}`}
                        default_value={textColor} 
                        onChange={handleTextColorChange}
                        label={t('cardEditor.textColor')}
                    />
                </div>
            </div>

            {/* 图标选择 */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <Label className="text-sm font-semibold">{t('cardEditor.cardIcon')}</Label>
                    {formData.icon && (
                        <button
                            type="button"
                            onClick={() => onChange({ icon: undefined })}
                            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                            <RiCloseLine size={14} />
                            {t('common.delete')}
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
                            placeholder={t('cardEditor.searchIcon')}
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
                                {t(`cardEditor.iconCategories.${cat}`)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 图标列表 */}
                <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1">
                        {filteredIcons.map((iconKey) => {
                            const Icon = ICON_MAP[iconKey];
                            const isSelected = formData.icon === iconKey;
                            
                            return (
                                <button
                                    key={iconKey}
                                    type="button"
                                    onClick={() => onChange({ icon: iconKey })}
                                    className={`
                                        p-2 rounded-md transition-all hover:bg-gray-200
                                        flex items-center gap-3 text-left 
                                        ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-white text-gray-600'}
                                    `}
                                    title={iconKey}
                                >
                                    <Icon size={20} className="flex-shrink-0" />
                                    <span className="text-xs font-light overflow-hidden text-ellipsis whitespace-nowrap">
                                        {iconKey}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardStyleEditor;
