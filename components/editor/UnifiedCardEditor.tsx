'use client';

import React, { useState, useEffect } from 'react';
import { BentoCardProps, CardSize, CardType } from '@/lib/types';
import { 
    RiCloseLine, 
    RiDeleteBinLine, 
    RiLayoutGridFill,
    RiEyeLine,
    RiEyeOffLine,
} from '@remixicon/react';
import { Button } from '@/components/ui/button';
import CardPreview from '@/components/editor/CardPreview';
import { useTranslations } from 'next-intl';
import UnifiedTypeSelector from '@/components/editor/UnifiedTypeSelector';
import UnifiedContentEditor from '@/components/editor/UnifiedContentEditor';
import UnifiedStyleEditor from '@/components/editor/UnifiedStyleEditor';

interface UnifiedCardEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (card: BentoCardProps) => void;
    onDelete: (id: string) => void;
    initialData: BentoCardProps | null;
}

const UnifiedCardEditor: React.FC<UnifiedCardEditorProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    onDelete, 
    initialData 
}) => {
    const t = useTranslations();
    const [formData, setFormData] = useState<Partial<BentoCardProps>>({
        id: crypto.randomUUID(),
        title: '',
        subtitle: '',
        buttonText: '',
        url: '',
        type: 'universal',
        size: CardSize.Small,
        colorClass: 'custom-color',
        customBgColor: 'hsla(0, 0%, 100%, 0.8)',
        customTextColor: 'hsla(0, 0%, 0%, 1)',
        icon: 'link',
    });

    const [showPreview, setShowPreview] = useState(true);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    id: initialData.id,
                    title: initialData.title || '',
                    subtitle: initialData.subtitle || '',
                    buttonText: initialData.buttonText || '',
                    url: initialData.url || '',
                    imageUrl: initialData.imageUrl || '',
                    type: initialData.type || 'universal',
                    size: initialData.size || CardSize.Small,
                    colorClass: initialData.customBgColor ? 'custom-color' : (initialData.colorClass || 'custom-color'),
                    customBgColor: initialData.customBgColor || 'hsla(0, 0%, 100%, 0.8)',
                    customTextColor: initialData.customTextColor || 'hsla(0, 0%, 0%, 1)',
                    icon: initialData.icon || 'link',
                    githubData: initialData.githubData,
                    mastodonData: initialData.mastodonData,
                    contactInfo: initialData.contactInfo,
                    blogPosts: initialData.blogPosts,
                    articleContent: initialData.articleContent,
                });
            } else {
                setFormData({
                    id: crypto.randomUUID(),
                    title: '',
                    subtitle: '',
                    buttonText: '',
                    url: '',
                    type: 'universal',
                    size: CardSize.Small,
                    colorClass: 'custom-color',
                    customBgColor: 'hsla(0, 0%, 100%, 0.8)',
                    customTextColor: 'hsla(0, 0%, 0%, 1)',
                    icon: 'link',
                });
            }
            setShowPreview(true);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanData = { ...formData };
        
        // Clean up unused fields based on card type
        if (cleanData.type !== 'universal' && cleanData.type !== 'article' && cleanData.type !== 'image' && cleanData.type !== 'image-link') {
            delete cleanData.imageUrl;
        }
        if (cleanData.type !== 'article') {
            delete cleanData.articleContent;
        }
        if (!cleanData.type?.startsWith('contact-')) {
            delete cleanData.contactInfo;
        }
        if (cleanData.type?.startsWith('contact-')) {
            delete cleanData.url;
        }
        if (cleanData.type !== 'social-github') {
            delete cleanData.githubData;
        }
        if (cleanData.type !== 'social-mastodon') {
            delete cleanData.mastodonData;
        }
        if (cleanData.type !== 'blog-rss') {
            delete cleanData.blogPosts;
        }
        
        // 如果 icon 是空字符串或 undefined，删除该字段
        if (!cleanData.icon || cleanData.icon === '') {
            delete cleanData.icon;
        }
        
        onSave(cleanData as BentoCardProps);
        onClose();
    };

    const updateFormData = (updates: Partial<BentoCardProps>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={onClose}
            />
            
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <RiLayoutGridFill size={24} className="text-gray-900 dark:text-white" />
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {initialData ? t('editor.title') : t('editor.title')}
                            </h2>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowPreview(!showPreview)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                            title={showPreview ? 'Hide Preview' : 'Show Preview'}
                        >
                            {showPreview ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
                        </button>
                        <button 
                            onClick={onClose} 
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                        >
                            <RiCloseLine size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex">
                    {/* Left: Editor */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        
                        {/* 1. Card Type & Size */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                1. {t('editor.cardType')} & {t('editor.cardSize')}
                            </h3>
                            <UnifiedTypeSelector
                                type={formData.type || 'universal'}
                                size={formData.size || CardSize.Small}
                                onChange={(type: CardType, size?: CardSize) => updateFormData({ type, size })}
                            />
                        </div>

                        {/* 2. Content */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                2. {t('editor.content')}
                            </h3>
                            <UnifiedContentEditor
                                formData={formData}
                                onChange={updateFormData}
                            />
                        </div>

                        {/* 3. Style */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                3. {t('editor.style')}
                            </h3>
                            <UnifiedStyleEditor
                                formData={formData}
                                onChange={updateFormData}
                            />
                        </div>
                    </div>

                    {/* Right: Preview */}
                    {showPreview && (
                        <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
                            <div className="sticky top-0 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('editor.preview')}</h3>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Real-time</span>
                                </div>
                                <CardPreview data={formData as BentoCardProps} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                    <div>
                        {initialData && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => {
                                    if (confirm(t('common.confirm'))) {
                                        onDelete(initialData.id);
                                        onClose();
                                    }
                                }}
                                className="gap-2"
                            >
                                <RiDeleteBinLine size={16} />
                                {t('common.delete')}
                            </Button>
                        )}
                    </div>
                    
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                        >
                            {t('common.save')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedCardEditor;
