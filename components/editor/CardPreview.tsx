'use client';

import React from 'react';
import { BentoCardProps, CardSize } from '@/lib/types';
import { ICON_MAP } from '@/components/bento/BentoCard';
import { useTranslations } from 'next-intl';

interface CardPreviewProps {
    data: BentoCardProps;
}

const CardPreview: React.FC<CardPreviewProps> = ({ data }) => {
    const t = useTranslations();
    const Icon = data.icon ? ICON_MAP[data.icon] : null;
    
    const sizeClasses = {
        [CardSize.Small]: 'col-span-1 row-span-1',
        [CardSize.Medium]: 'col-span-2 row-span-1',
        [CardSize.Tall]: 'col-span-1 row-span-2',
        [CardSize.Large]: 'col-span-2 row-span-2',
    };

    const isImageCard = data.type === 'image' || data.type === 'image-link';
    
    // 使用自定义颜色或默认样式
    const cardStyle = data.customBgColor ? {
        backgroundColor: data.customBgColor,
        color: data.customTextColor || 'inherit',
        ...(isImageCard && data.imageUrl ? { 
            backgroundImage: `url(${data.imageUrl})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
        } : {})
    } : (isImageCard && data.imageUrl ? { 
        backgroundImage: `url(${data.imageUrl})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
    } : {});

    return (
        <div className="space-y-4">
            <div className="text-xs text-gray-500 mb-2">
                {t('cardEditor.previewNote')}
            </div>
            
            {/* 卡片预览 */}
            <div 
                className={`
                    relative rounded-2xl p-4 shadow-lg transition-all
                    ${!data.customBgColor ? (data.colorClass || 'bg-gray-100/80 text-black') : ''}
                    ${sizeClasses[data.size || CardSize.Small]}
                    min-h-52 flex flex-col justify-between
                `}
                style={cardStyle}
            >
                {/* 图标 */}
                {Icon && !isImageCard && (
                    <div className="absolute top-3 right-3 opacity-80">
                        <Icon size={20} />
                    </div>
                )}

                {/* 内容 */}
                <div className={isImageCard ? 'relative z-10' : ''}>
                    {data.title && (
                        <h3 className="font-bold text-sm mb-1 line-clamp-2">
                            {data.title}
                        </h3>
                    )}
                    {data.subtitle && (
                        <p className="text-xs opacity-80 line-clamp-2">
                            {data.subtitle}
                        </p>
                    )}
                </div>

                {/* 按钮 */}
                {data.buttonText && !isImageCard && (
                    <div className="mt-3">
                        <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-medium">
                            {data.buttonText}
                        </div>
                    </div>
                )}
            </div>

            {/* 信息提示 */}
            <div className="text-xs text-gray-500 space-y-1">
                <div>{t('cardEditor.type')}: {data.type}</div>
                <div>{t('cardEditor.size')}: {data.size}</div>
                {data.url && <div className="truncate">{t('cardEditor.link')}: {data.url}</div>}
            </div>
        </div>
    );
};

export default CardPreview;
