'use client';

import React, { useState, useCallback } from 'react';
import { BentoCardProps } from '@/lib/types';
import { ICON_MAP } from '@/components/bento/BentoCard';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RiSearchLine, RiCloseLine } from '@remixicon/react';
import { useTranslations } from 'next-intl';
import ColorPicker from '@/components/ui/colorpicker';

interface UnifiedStyleEditorProps {
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

// 预设背景颜色
const PRESET_BG_COLORS = [
    { name: '白色', value: 'hsla(0, 0%, 100%, 0.8)' },
    { name: '浅灰', value: 'hsla(0, 0%, 96%, 0.8)' },
    { name: '灰色', value: 'hsla(0, 0%, 90%, 0.8)' },
    { name: '黑色', value: 'hsla(0, 0%, 0%, 0.8)' },
    { name: '蓝色', value: 'hsla(217, 91%, 60%, 0.8)' },
    { name: '绿色', value: 'hsla(158, 64%, 52%, 0.8)' },
];

const UnifiedStyleEditor: React.FC<UnifiedStyleEditorProps> = ({ formData, onChange }) => {
    const t = useTranslations();
    const [iconSearch, setIconSearch] = useState('');
    const [iconCategory, setIconCategory] = useState<string>('all');
    const [bgColor, setBgColor] = useState(formData.customBgColor || 'hsla(0, 0%, 100%, 0.8)');
    const [textColor, setTextColor] = useState(formData.customTextColor || 'hsla(0, 0%, 0%, 1)');
    const [showBgColorPicker, setShowBgColorPicker] = useState(false);

    // 当 formData.id 变化时（切换卡片），重置颜色状态
    React.useEffect(() => {
        setBgColor(formData.customBgColor || 'hsla(0, 0%, 100%, 0.8)');
        setTextColor(formData.customTextColor || 'hsla(0, 0%, 0%, 1)');
        setShowBgColorPicker(false);
    }, [formData.id, formData.customBgColor, formData.customTextColor]);

    // 图片类型不需要样式编辑
    if (formData.type === 'image' || formData.type === 'image-link') {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
        onChange({ 
            colorClass: 'custom-color',
            customBgColor: color,
            customTextColor: textColor
        });
    }, [textColor, onChange]);

    const handleTextColorChange = useCallback((color: string) => {
        setTextColor(color);
        onChange({ 
            colorClass: 'custom-color',
            customBgColor: bgColor,
            customTextColor: color
        });
    }, [bgColor, onChange]);

    return (
        <div className="space-y-6">
            {/* 背景颜色选择 */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">{t('cardEditor.backgroundColor')}</Label>
                <div className="grid grid-cols-4 gap-2">
                    {PRESET_BG_COLORS.map((color) => (
                        <button
                            key={color.value}
                            type="button"
                            onClick={() => {
                                handleBgColorChange(color.value);
                                setShowBgColorPicker(false);
                            }}
                            className={`
                                h-12 rounded-lg border-2 transition-all relative
                                ${bgColor === color.value 
                                    ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }
                            `}
                            style={{ background: color.value }}
                            title={color.name}
                        >
                            {bgColor === color.value && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white" />
                                </div>
                            )}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                        className={`
                            h-12 rounded-lg border-2 transition-all flex items-center justify-center text-sm font-medium
                            ${showBgColorPicker 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                            }
                        `}
                    >
                        {t('cardEditor.customColor')}
                    </button>
                </div>
                
                {/* 自定义颜色选择器 */}
                {showBgColorPicker && (
                    <div className="flex justify-center pt-2">
                        <ColorPicker 
                            key={`bg-${formData.id}`}
                            default_value={bgColor} 
                            onChange={handleBgColorChange}
                            label={t('cardEditor.backgroundColor')}
                        />
                    </div>
                )}
            </div>

            {/* 文字颜色选择 */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">{t('cardEditor.textColor')}</Label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => handleTextColorChange('hsla(0, 0%, 100%, 1)')}
                        className={`
                            p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2
                            ${textColor === 'hsla(0, 0%, 100%, 1)' 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }
                        `}
                    >
                        <div className="w-6 h-6 rounded-full bg-white border border-gray-300" />
                        <span className="text-sm font-medium">{t('cardEditor.whiteText')}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTextColorChange('hsla(0, 0%, 0%, 1)')}
                        className={`
                            p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2
                            ${textColor === 'hsla(0, 0%, 0%, 1)' 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }
                        `}
                    >
                        <div className="w-6 h-6 rounded-full bg-black" />
                        <span className="text-sm font-medium">{t('cardEditor.blackText')}</span>
                    </button>
                </div>
            </div>

            {/* 图标选择 */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <Label className="text-sm font-semibold">{t('cardEditor.cardIcon')}</Label>
                    {formData.icon && formData.icon !== '' && (
                        <button
                            type="button"
                            onClick={() => onChange({ icon: '' })}
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
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }
                                `}
                            >
                                {t(`cardEditor.iconCategories.${cat}`)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 图标列表 */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800 max-h-64 overflow-y-auto">
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
                                        p-2 rounded-md transition-all hover:bg-gray-200 dark:hover:bg-gray-700
                                        flex items-center gap-3 text-left 
                                        ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400'}
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

export default UnifiedStyleEditor;
