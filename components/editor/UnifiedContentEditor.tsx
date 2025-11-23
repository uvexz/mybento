'use client';

import React from 'react';
import { BentoCardProps } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/ImageUpload';
import CardContentEditor from '@/components/editor/CardContentEditor';
import { useTranslations } from 'next-intl';

interface UnifiedContentEditorProps {
    formData: Partial<BentoCardProps>;
    onChange: (updates: Partial<BentoCardProps>) => void;
}

const UnifiedContentEditor: React.FC<UnifiedContentEditorProps> = ({ formData, onChange }) => {
    const t = useTranslations();
    const type = formData.type;

    // Universal Card - 所有字段可选
    if (type === 'universal') {
        return (
            <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                        {t('cardEditor.universalCardHint')}
                    </p>
                </div>

                <div>
                    <Label className="text-sm font-medium mb-2 block">{t('cardEditor.titleOptional')}</Label>
                    <Input
                        value={formData.title || ''}
                        onChange={(e) => onChange({ title: e.target.value })}
                        placeholder={t('cardEditor.cardTitle')}
                    />
                </div>

                <div>
                    <Label className="text-sm font-medium mb-2 block">{t('cardEditor.subtitleOptional')}</Label>
                    <Input
                        value={formData.subtitle || ''}
                        onChange={(e) => onChange({ subtitle: e.target.value })}
                        placeholder={t('cardEditor.supplementaryInfo')}
                    />
                </div>

                <div>
                    <Label className="text-sm font-medium mb-2 block">{t('cardEditor.linkUrl')} ({t('common.optional')})</Label>
                    <Input
                        type="url"
                        value={formData.url || ''}
                        onChange={(e) => onChange({ url: e.target.value })}
                        placeholder="https://example.com"
                        className="font-mono"
                    />
                </div>

                <div>
                    <Label className="text-sm font-medium mb-2 block">{t('cardEditor.backgroundImageUrl')} ({t('common.optional')})</Label>
                    <ImageUpload
                        value={formData.imageUrl || ''}
                        onChange={(url) => onChange({ imageUrl: url })}
                        folder="cards"
                        placeholder={t('cardEditor.backgroundImagePlaceholder')}
                    />
                </div>

                <div>
                    <Label className="text-sm font-medium mb-2 block">{t('cardEditor.buttonText')} ({t('common.optional')})</Label>
                    <Input
                        value={formData.buttonText || ''}
                        onChange={(e) => onChange({ buttonText: e.target.value })}
                        placeholder={t('cardEditor.visitButtonPlaceholder')}
                    />
                </div>
            </div>
        );
    }

    // Text Card - 简单文字卡片
    if (type === 'text') {
        return (
            <div className="space-y-4">
                <div>
                    <Label className="text-sm font-medium mb-2 block">{t('cardEditor.title')}</Label>
                    <Input
                        value={formData.title || ''}
                        onChange={(e) => onChange({ title: e.target.value })}
                        placeholder={t('cardEditor.cardTitle')}
                    />
                </div>

                <div>
                    <Label className="text-sm font-medium mb-2 block">{t('cardEditor.subtitleOptional')}</Label>
                    <Textarea
                        value={formData.subtitle || ''}
                        onChange={(e) => onChange({ subtitle: e.target.value })}
                        placeholder={t('cardEditor.supplementaryInfo')}
                        className="min-h-[100px]"
                    />
                </div>
            </div>
        );
    }

    // Article Card - 支持背景图片
    if (type === 'article') {
        return (
            <div className="space-y-4">
                <div>
                    <Label className="text-sm font-medium mb-2 block">{t('cardEditor.articleTitle')}</Label>
                    <Input
                        value={formData.title || ''}
                        onChange={(e) => onChange({ title: e.target.value })}
                        placeholder={t('cardEditor.articleTitlePlaceholder')}
                    />
                </div>

                <div>
                    <Label className="text-sm font-medium mb-2 block">{t('cardEditor.articleSubtitle')}</Label>
                    <Input
                        value={formData.subtitle || ''}
                        onChange={(e) => onChange({ subtitle: e.target.value })}
                        placeholder={t('cardEditor.articleSubtitlePlaceholder')}
                    />
                </div>

                <div>
                    <Label className="text-sm font-medium mb-2 block">{t('cardEditor.backgroundImageUrl')} ({t('common.optional')})</Label>
                    <ImageUpload
                        value={formData.imageUrl || ''}
                        onChange={(url) => onChange({ imageUrl: url })}
                        folder="cards"
                        placeholder={t('cardEditor.backgroundImagePlaceholder')}
                    />
                </div>

                <div>
                    <Label className="text-sm font-medium mb-2 block">{t('cardEditor.articleContent')}</Label>
                    <Textarea
                        value={formData.articleContent || ''}
                        onChange={(e) => onChange({ articleContent: e.target.value })}
                        placeholder={t('cardEditor.articleContentPlaceholder')}
                        className="font-mono min-h-[200px] resize-y"
                    />
                </div>
            </div>
        );
    }

    // 其他所有卡片类型使用原有的 CardContentEditor
    return <CardContentEditor formData={formData} onChange={onChange} />;
};

export default UnifiedContentEditor;
