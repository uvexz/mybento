'use client';

import React, { useState } from 'react';
import { BentoCardProps } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/ImageUpload';
import { 
    RiInformationFill,
    RiRefreshFill,
    RiCheckboxCircleFill,
    RiCloseCircleFill,
    RiShieldCheckFill,
    RiMailFill,
    RiPhoneFill,
    RiQqFill,
    RiWechatFill,
    RiTelegramFill,
} from '@remixicon/react';
import { useTranslations } from 'next-intl';

interface CardContentEditorProps {
    formData: Partial<BentoCardProps>;
    onChange: (updates: Partial<BentoCardProps>) => void;
}

const CardContentEditor: React.FC<CardContentEditorProps> = ({ formData, onChange }) => {
    const t = useTranslations();
    const [isLoadingGitHub, setIsLoadingGitHub] = useState(false);
    const [githubError, setGithubError] = useState<string | null>(null);
    const [isLoadingMastodon, setIsLoadingMastodon] = useState(false);
    const [mastodonError, setMastodonError] = useState<string | null>(null);

    const fetchGitHubData = async (path: string) => {
        if (!path) return;
        
        setIsLoadingGitHub(true);
        setGithubError(null);

        try {
            const response = await fetch(`/api/github?path=${encodeURIComponent(path)}`);
            const data = await response.json();

            if (!response.ok) {
                setGithubError(data.error || t('cardEditor.githubFetchError'));
                return;
            }

            if (data.type === 'user') {
                onChange({
                    title: data.name || data.login,
                    subtitle: data.bio || `${t('cardEditor.githubFollowers', { count: data.followers })} · ${t('cardEditor.githubRepos', { count: data.publicRepos })}`,
                    url: data.url,
                    githubData: data,
                });
            } else if (data.type === 'repo') {
                onChange({
                    title: data.name,
                    subtitle: data.description || `⭐ ${data.stars} · 🍴 ${data.forks}${data.language ? ` · ${data.language}` : ''}`,
                    url: data.url,
                    githubData: data,
                });
            }
        } catch (error) {
            setGithubError(t('cardEditor.githubFetchError'));
        } finally {
            setIsLoadingGitHub(false);
        }
    };

    const fetchMastodonData = async (input: string) => {
        if (!input) return;
        
        setIsLoadingMastodon(true);
        setMastodonError(null);

        try {
            const response = await fetch(`/api/mastodon?input=${encodeURIComponent(input)}`);
            const data = await response.json();

            if (!response.ok) {
                setMastodonError(data.error || t('cardEditor.mastodonFetchError'));
                return;
            }

            onChange({
                title: formData.title || data.name,
                subtitle: data.description?.replace('Public posts from ', '') || '',
                url: input,
                mastodonData: data,
            });
        } catch (error) {
            setMastodonError(t('cardEditor.mastodonFetchError'));
        } finally {
            setIsLoadingMastodon(false);
        }
    };

    const handleGitHubUrlChange = (value: string) => {
        onChange({ url: value });
        setGithubError(null);
        
        if (formData.type === 'social-github' && value) {
            const timeoutId = setTimeout(() => {
                fetchGitHubData(value);
            }, 800);
            return () => clearTimeout(timeoutId);
        }
    };

    const handleMastodonInputChange = (value: string) => {
        onChange({ url: value });
        setMastodonError(null);
        
        if (formData.type === 'social-mastodon' && value) {
            const timeoutId = setTimeout(() => {
                fetchMastodonData(value);
            }, 800);
            return () => clearTimeout(timeoutId);
        }
    };

    const renderContentFields = () => {
        const type = formData.type;

        // 图片类型卡片
        if (type === 'image' || type === 'image-link') {
            return (
                <>
                    <div>
                        <Label className="text-sm font-medium mb-2 block">{t('cardEditor.image')}</Label>
                        <ImageUpload
                            value={formData.imageUrl || ''}
                            onChange={(url) => onChange({ imageUrl: url })}
                            folder="cards"
                            placeholder={t('cardEditor.uploadImagePlaceholder')}
                        />
                    </div>

                    {type === 'image-link' && (
                        <div>
                            <Label className="text-sm font-medium mb-2 block">{t('cardEditor.linkUrl')}</Label>
                            <Input
                                type="url"
                                value={formData.url || ''}
                                onChange={(e) => onChange({ url: e.target.value })}
                                placeholder="https://example.com"
                            />
                        </div>
                    )}

                    <div>
                        <Label className="text-sm font-medium mb-2 block">{t('cardEditor.titleOptional')}</Label>
                        <Input
                            value={formData.title || ''}
                            onChange={(e) => onChange({ title: e.target.value })}
                            placeholder={t('cardEditor.imageTitlePlaceholder')}
                        />
                    </div>
                </>
            );
        }

        // GitHub 卡片
        if (type === 'social-github') {
            return (
                <>
                    <div>
                        <Label className="text-sm font-medium mb-2 block">{t('cardEditor.githubUsernameOrRepo')}</Label>
                        <Input
                            value={formData.url || ''}
                            onChange={(e) => handleGitHubUrlChange(e.target.value)}
                            placeholder={t('cardEditor.githubPlaceholder')}
                            className="font-mono"
                        />
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <RiInformationFill size={12} />
                            {t('cardEditor.githubHint')}
                        </p>
                        {isLoadingGitHub && (
                            <p className="text-xs text-blue-500 mt-2 flex items-center gap-1">
                                <RiRefreshFill size={12} className="animate-spin" />
                                {t('cardEditor.githubLoading')}
                            </p>
                        )}
                        {githubError && (
                            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                <RiCloseCircleFill size={12} />
                                {githubError}
                            </p>
                        )}
                        {formData.githubData && (
                            <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                                <RiCheckboxCircleFill size={12} />
                                {t('cardEditor.githubLoaded')}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label className="text-sm font-medium mb-2 block">{t('cardEditor.title')}</Label>
                        <Input
                            value={formData.title || ''}
                            onChange={(e) => onChange({ title: e.target.value })}
                            placeholder={t('cardEditor.githubAutoFetch')}
                        />
                    </div>

                    <div>
                        <Label className="text-sm font-medium mb-2 block">{t('cardEditor.subtitleOptional')}</Label>
                        <Input
                            value={formData.subtitle || ''}
                            onChange={(e) => onChange({ subtitle: e.target.value })}
                            placeholder={t('cardEditor.githubAutoFetch')}
                        />
                    </div>
                </>
            );
        }

        // Mastodon 卡片
        if (type === 'social-mastodon') {
            return (
                <>
                    <div>
                        <Label className="text-sm font-medium mb-2 block">{t('cardEditor.mastodonAccount')}</Label>
                        <Input
                            value={formData.url || ''}
                            onChange={(e) => handleMastodonInputChange(e.target.value)}
                            placeholder={t('cardEditor.mastodonPlaceholder')}
                            className="font-mono"
                        />
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <RiInformationFill size={12} />
                            {t('cardEditor.mastodonHint')}
                        </p>
                        {isLoadingMastodon && (
                            <p className="text-xs text-blue-500 mt-2 flex items-center gap-1">
                                <RiRefreshFill size={12} className="animate-spin" />
                                {t('cardEditor.mastodonLoading')}
                            </p>
                        )}
                        {mastodonError && (
                            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                <RiCloseCircleFill size={12} />
                                {mastodonError}
                            </p>
                        )}
                        {formData.mastodonData && (
                            <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                                <RiCheckboxCircleFill size={12} />
                                {t('cardEditor.mastodonLoaded')}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label className="text-sm font-medium mb-2 block">{t('cardEditor.title')}</Label>
                        <Input
                            value={formData.title || ''}
                            onChange={(e) => onChange({ title: e.target.value })}
                            placeholder={t('cardEditor.mastodonAutoFetch')}
                        />
                    </div>
                </>
            );
        }

        // 联系方式卡片
        if (type?.startsWith('contact-')) {
            const contactIcons = {
                'contact-email': { icon: RiMailFill, placeholder: t('cardEditor.contactEmailPlaceholder'), label: t('cardEditor.contactEmail') },
                'contact-phone': { icon: RiPhoneFill, placeholder: t('cardEditor.contactPhonePlaceholder'), label: t('cardEditor.contactPhone') },
                'contact-qq': { icon: RiQqFill, placeholder: t('cardEditor.contactQQPlaceholder'), label: t('cardEditor.contactQQ') },
                'contact-wechat': { icon: RiWechatFill, placeholder: t('cardEditor.contactWechatPlaceholder'), label: t('cardEditor.contactWechat') },
                'contact-telegram': { icon: RiTelegramFill, placeholder: t('cardEditor.contactTelegramPlaceholder'), label: t('cardEditor.contactTelegram') },
            };

            const config = contactIcons[type as keyof typeof contactIcons];
            const Icon = config?.icon;

            return (
                <>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-800 flex items-center gap-2">
                            <RiShieldCheckFill size={14} />
                            {t('cardEditor.contactEncryptionNotice')}
                        </p>
                    </div>

                    <div>
                        <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                            {Icon && <Icon size={16} />}
                            {config?.label}
                        </Label>
                        <Input
                            value={formData.contactInfo ? atob(formData.contactInfo) : ''}
                            onChange={(e) => onChange({ contactInfo: btoa(e.target.value) })}
                            placeholder={config?.placeholder}
                            className="font-mono"
                        />
                    </div>

                    <div>
                        <Label className="text-sm font-medium mb-2 block">{t('cardEditor.displayTitle')}</Label>
                        <Input
                            value={formData.title || ''}
                            onChange={(e) => onChange({ title: e.target.value })}
                            placeholder={t('cardEditor.contactMePlaceholder')}
                        />
                    </div>

                    <div>
                        <Label className="text-sm font-medium mb-2 block">{t('cardEditor.buttonText')}</Label>
                        <Input
                            value={formData.buttonText || ''}
                            onChange={(e) => onChange({ buttonText: e.target.value })}
                            placeholder={t('cardEditor.contactButtonPlaceholder')}
                        />
                    </div>
                </>
            );
        }

        // 视频/音乐嵌入卡片
        if (type?.startsWith('video-') || type?.startsWith('music-')) {
            const hints = {
                'video-youtube': 'https://youtube.com/watch?v=...',
                'video-vimeo': 'https://vimeo.com/123456789',
                'music-spotify': 'https://open.spotify.com/track/...',
                'music-soundcloud': 'https://soundcloud.com/...',
            };

            return (
                <>
                    <div>
                        <Label className="text-sm font-medium mb-2 block">{t('cardEditor.mediaLink')}</Label>
                        <Input
                            type="url"
                            value={formData.url || ''}
                            onChange={(e) => onChange({ url: e.target.value })}
                            placeholder={hints[type as keyof typeof hints]}
                            className="font-mono"
                        />
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <RiInformationFill size={12} />
                            {t('cardEditor.mediaLinkHint')}
                        </p>
                    </div>

                    <div>
                        <Label className="text-sm font-medium mb-2 block">{t('cardEditor.title')}</Label>
                        <Input
                            value={formData.title || ''}
                            onChange={(e) => onChange({ title: e.target.value })}
                            placeholder={t('cardEditor.mediaTitle')}
                        />
                    </div>

                    <div>
                        <Label className="text-sm font-medium mb-2 block">{t('cardEditor.subtitleOptional')}</Label>
                        <Input
                            value={formData.subtitle || ''}
                            onChange={(e) => onChange({ subtitle: e.target.value })}
                            placeholder={t('cardEditor.descriptionPlaceholder')}
                        />
                    </div>
                </>
            );
        }

        // Blog RSS 卡片
        if (type === 'blog-rss') {
            return (
                <>
                    <div>
                        <Label className="text-sm font-medium mb-2 block">{t('cardEditor.rssFeedUrl')}</Label>
                        <Input
                            type="url"
                            value={formData.url || ''}
                            onChange={(e) => onChange({ url: e.target.value })}
                            placeholder={t('cardEditor.rssFeedPlaceholder')}
                            className="font-mono"
                        />
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <RiInformationFill size={12} />
                            {t('cardEditor.rssFeedHint')}
                        </p>
                    </div>

                    <div>
                        <Label className="text-sm font-medium mb-2 block">{t('cardEditor.blogName')}</Label>
                        <Input
                            value={formData.title || ''}
                            onChange={(e) => onChange({ title: e.target.value })}
                            placeholder={t('cardEditor.myBlogPlaceholder')}
                        />
                    </div>
                </>
            );
        }

        // Article 卡片
        if (type === 'article') {
            return (
                <>
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
                        <Label className="text-sm font-medium mb-2 block">{t('cardEditor.articleContent')}</Label>
                        <Textarea
                            value={formData.articleContent || ''}
                            onChange={(e) => onChange({ articleContent: e.target.value })}
                            placeholder={t('cardEditor.articleContentPlaceholder')}
                            className="font-mono min-h-[300px] resize-y"
                        />
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <RiInformationFill size={12} />
                            {t('cardEditor.articleMarkdownHint')}
                        </p>
                    </div>
                </>
            );
        }

        // 标准链接卡片和其他社交媒体卡片
        return (
            <>
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
                    <Input
                        value={formData.subtitle || ''}
                        onChange={(e) => onChange({ subtitle: e.target.value })}
                        placeholder={t('cardEditor.supplementaryInfo')}
                    />
                </div>

                <div>
                    <Label className="text-sm font-medium mb-2 block">{t('cardEditor.linkUrl')}</Label>
                    <Input
                        type="url"
                        value={formData.url || ''}
                        onChange={(e) => onChange({ url: e.target.value })}
                        placeholder="https://example.com"
                        className="font-mono"
                    />
                </div>

                <div>
                    <Label className="text-sm font-medium mb-2 block">{t('cardEditor.buttonText')}</Label>
                    <Input
                        value={formData.buttonText || ''}
                        onChange={(e) => onChange({ buttonText: e.target.value })}
                        placeholder={t('cardEditor.visitButtonPlaceholder')}
                    />
                </div>
            </>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <RiInformationFill size={16} className="text-blue-500" />
                <span>{t('cardEditor.contentInfo')}</span>
            </div>
            
            {renderContentFields()}
        </div>
    );
};

export default CardContentEditor;
