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
import { Label } from '@/components/ui/label';
import CardTypeSelector from '@/components/editor/CardTypeSelector';
import CardContentEditor from '@/components/editor/CardContentEditor';
import CardStyleEditor from '@/components/editor/CardStyleEditor';
import CardPreview from '@/components/editor/CardPreview';

interface CardEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (card: BentoCardProps) => void;
    onDelete: (id: string) => void;
    initialData: BentoCardProps | null;
}

const CardEditorModal: React.FC<CardEditorModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    onDelete, 
    initialData 
}) => {
    const [formData, setFormData] = useState<Partial<BentoCardProps>>({
        id: crypto.randomUUID(),
        title: '',
        subtitle: '',
        buttonText: 'Visit',
        url: '',
        type: 'link',
        size: CardSize.Small,
        colorClass: 'bg-gray-100/80 text-black',
        icon: 'link',
    });

    const [showPreview, setShowPreview] = useState(true);
    const [activeTab, setActiveTab] = useState<'type' | 'content' | 'style'>('content');

    // 重置表单数据
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // 编辑模式：保留所有字段
                setFormData({
                    id: initialData.id,
                    title: initialData.title || '',
                    subtitle: initialData.subtitle || '',
                    buttonText: initialData.buttonText || '',
                    url: initialData.url || '',
                    imageUrl: initialData.imageUrl || '',
                    type: initialData.type || 'link',
                    size: initialData.size || CardSize.Small,
                    colorClass: initialData.colorClass || 'bg-gray-100/80 text-black',
                    icon: initialData.icon || 'link',
                    githubData: initialData.githubData,
                    mastodonData: initialData.mastodonData,
                    contactInfo: initialData.contactInfo,
                    blogPosts: initialData.blogPosts,
                });
            } else {
                // 新建模式：使用默认值
                setFormData({
                    id: crypto.randomUUID(),
                    title: '',
                    subtitle: '',
                    buttonText: 'Visit',
                    url: '',
                    type: 'link',
                    size: CardSize.Small,
                    colorClass: 'bg-gray-100/80 text-black',
                    icon: 'link',
                });
            }
            setShowPreview(true);
            setActiveTab('content');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // 清理数据
        const cleanData = { ...formData };
        
        // 只保留当前类型需要的字段
        if (cleanData.type !== 'image' && cleanData.type !== 'image-link') {
            delete cleanData.imageUrl;
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
                        <RiLayoutGridFill size={24} className="text-blue-500" />
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {initialData ? 'Edit Card' : 'Create New Card'}
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {initialData ? 'Modify card content and style' : 'Choose type and fill in content'}
                            </p>
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
                    {/* 左侧：编辑区 */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Tab Navigation */}
                        <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex px-6">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('type')}
                                    className={`
                                        px-4 py-3 text-sm font-medium border-b-2 transition-colors
                                        ${activeTab === 'type'
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                        }
                                    `}
                                >
                                    1. Type & Size
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('content')}
                                    className={`
                                        px-4 py-3 text-sm font-medium border-b-2 transition-colors
                                        ${activeTab === 'content'
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                        }
                                    `}
                                >
                                    2. Content
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('style')}
                                    className={`
                                        px-4 py-3 text-sm font-medium border-b-2 transition-colors
                                        ${activeTab === 'style'
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                        }
                                    `}
                                >
                                    3. Style
                                </button>
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {activeTab === 'type' && (
                                <CardTypeSelector
                                    value={formData.type || 'link'}
                                    size={formData.size || CardSize.Small}
                                    onChange={(type: CardType, size?: CardSize) => {
                                        updateFormData({ type, size });
                                        setActiveTab('content');
                                    }}
                                />
                            )}

                            {activeTab === 'content' && (
                                <CardContentEditor
                                    formData={formData}
                                    onChange={updateFormData}
                                />
                            )}

                            {activeTab === 'style' && (
                                <CardStyleEditor
                                    formData={formData}
                                    onChange={updateFormData}
                                />
                            )}
                        </div>
                    </div>

                    {/* 右侧：预览区 */}
                    {showPreview && (
                        <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
                            <div className="sticky top-0 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Live Preview</h3>
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
                                    if (confirm('Are you sure you want to delete this card?')) {
                                        onDelete(initialData.id);
                                        onClose();
                                    }
                                }}
                                className="gap-2"
                            >
                                <RiDeleteBinLine size={16} />
                                Delete Card
                            </Button>
                        )}
                    </div>
                    
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                        >
                            {initialData ? 'Save Changes' : 'Create Card'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardEditorModal;
