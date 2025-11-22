'use client';

import React from 'react';
import { BentoCardProps, CardSize } from '@/lib/types';
import { ICON_MAP } from '@/components/bento/BentoCard';

interface CardPreviewProps {
    data: BentoCardProps;
}

const CardPreview: React.FC<CardPreviewProps> = ({ data }) => {
    const Icon = data.icon ? ICON_MAP[data.icon] : null;
    
    const sizeClasses = {
        [CardSize.Small]: 'col-span-1 row-span-1',
        [CardSize.Medium]: 'col-span-2 row-span-1',
        [CardSize.Tall]: 'col-span-1 row-span-2',
        [CardSize.Large]: 'col-span-2 row-span-2',
    };

    const isImageCard = data.type === 'image' || data.type === 'image-link';
    const bgStyle = isImageCard && data.imageUrl 
        ? { backgroundImage: `url(${data.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
        : {};

    return (
        <div className="space-y-3">
            <div className="text-xs text-gray-500 mb-2">
                预览效果（实际大小可能不同）
            </div>
            
            <div 
                className={`
                    relative rounded-2xl p-4 shadow-lg transition-all
                    ${data.colorClass || 'bg-gray-100/80 text-black'}
                    ${sizeClasses[data.size || CardSize.Small]}
                    min-h-[120px] flex flex-col justify-between
                `}
                style={bgStyle}
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
                <div>类型: {data.type}</div>
                <div>尺寸: {data.size}</div>
                {data.url && <div className="truncate">链接: {data.url}</div>}
            </div>
        </div>
    );
};

export default CardPreview;
