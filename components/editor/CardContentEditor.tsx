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

interface CardContentEditorProps {
    formData: Partial<BentoCardProps>;
    onChange: (updates: Partial<BentoCardProps>) => void;
}

const CardContentEditor: React.FC<CardContentEditorProps> = ({ formData, onChange }) => {
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
                setGithubError(data.error || '获取 GitHub 数据失败');
                return;
            }

            if (data.type === 'user') {
                onChange({
                    title: data.name || data.login,
                    subtitle: data.bio || `${data.followers} 关注者 · ${data.publicRepos} 仓库`,
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
            setGithubError('获取 GitHub 数据失败');
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
                setMastodonError(data.error || '获取 Mastodon 数据失败');
                return;
            }

            onChange({
                title: formData.title || data.name,
                subtitle: data.description?.replace('Public posts from ', '') || '',
                url: input,
                mastodonData: data,
            });
        } catch (error) {
            setMastodonError('获取 Mastodon 数据失败');
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
                        <Label className="text-sm font-medium mb-2 block">图片</Label>
                        <ImageUpload
                            value={formData.imageUrl || ''}
                            onChange={(url) => onChange({ imageUrl: url })}
                            folder="cards"
                            placeholder="上传图片或粘贴图片链接"
                        />
                    </div>

                    {type === 'image-link' && (
                        <div>
                            <Label className="text-sm font-medium mb-2 block">链接地址</Label>
                            <Input
                                type="url"
                                value={formData.url || ''}
                                onChange={(e) => onChange({ url: e.target.value })}
                                placeholder="https://example.com"
                            />
                        </div>
                    )}

                    <div>
                        <Label className="text-sm font-medium mb-2 block">标题（可选）</Label>
                        <Input
                            value={formData.title || ''}
                            onChange={(e) => onChange({ title: e.target.value })}
                            placeholder="图片标题"
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
                        <Label className="text-sm font-medium mb-2 block">GitHub 用户名或仓库</Label>
                        <Input
                            value={formData.url || ''}
                            onChange={(e) => handleGitHubUrlChange(e.target.value)}
                            placeholder="octocat 或 facebook/react"
                            className="font-mono"
                        />
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <RiInformationFill size={12} />
                            输入用户名或 用户名/仓库名
                        </p>
                        {isLoadingGitHub && (
                            <p className="text-xs text-blue-500 mt-2 flex items-center gap-1">
                                <RiRefreshFill size={12} className="animate-spin" />
                                正在获取 GitHub 数据...
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
                                GitHub 数据已加载
                            </p>
                        )}
                    </div>

                    <div>
                        <Label className="text-sm font-medium mb-2 block">标题</Label>
                        <Input
                            value={formData.title || ''}
                            onChange={(e) => onChange({ title: e.target.value })}
                            placeholder="自动从 GitHub 获取"
                        />
                    </div>

                    <div>
                        <Label className="text-sm font-medium mb-2 block">副标题（可选）</Label>
                        <Input
                            value={formData.subtitle || ''}
                            onChange={(e) => onChange({ subtitle: e.target.value })}
                            placeholder="自动从 GitHub 获取"
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
                        <Label className="text-sm font-medium mb-2 block">Mastodon 账号</Label>
                        <Input
                            value={formData.url || ''}
                            onChange={(e) => handleMastodonInputChange(e.target.value)}
                            placeholder="@username@instance.com"
                            className="font-mono"
                        />
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <RiInformationFill size={12} />
                            输入 @用户名@实例域名 或完整 URL
                        </p>
                        {isLoadingMastodon && (
                            <p className="text-xs text-blue-500 mt-2 flex items-center gap-1">
                                <RiRefreshFill size={12} className="animate-spin" />
                                正在获取 Mastodon 数据...
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
                                Mastodon 数据已加载
                            </p>
                        )}
                    </div>

                    <div>
                        <Label className="text-sm font-medium mb-2 block">标题</Label>
                        <Input
                            value={formData.title || ''}
                            onChange={(e) => onChange({ title: e.target.value })}
                            placeholder="自动从 Mastodon 获取"
                        />
                    </div>
                </>
            );
        }

        // 联系方式卡片
        if (type?.startsWith('contact-')) {
            const contactIcons = {
                'contact-email': { icon: RiMailFill, placeholder: 'your@email.com', label: 'Email 地址' },
                'contact-phone': { icon: RiPhoneFill, placeholder: '+86 138 0000 0000', label: '电话号码' },
                'contact-qq': { icon: RiQqFill, placeholder: '123456789', label: 'QQ 号码' },
                'contact-wechat': { icon: RiWechatFill, placeholder: 'your-wechat-id', label: '微信号' },
                'contact-telegram': { icon: RiTelegramFill, placeholder: 'username', label: 'Telegram 用户名' },
            };

            const config = contactIcons[type as keyof typeof contactIcons];
            const Icon = config?.icon;

            return (
                <>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-800 flex items-center gap-2">
                            <RiShieldCheckFill size={14} />
                            您的联系信息将被加密保护，防止爬虫抓取
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
                        <Label className="text-sm font-medium mb-2 block">显示标题</Label>
                        <Input
                            value={formData.title || ''}
                            onChange={(e) => onChange({ title: e.target.value })}
                            placeholder="联系我"
                        />
                    </div>

                    <div>
                        <Label className="text-sm font-medium mb-2 block">按钮文字</Label>
                        <Input
                            value={formData.buttonText || ''}
                            onChange={(e) => onChange({ buttonText: e.target.value })}
                            placeholder="联系"
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
                        <Label className="text-sm font-medium mb-2 block">媒体链接</Label>
                        <Input
                            type="url"
                            value={formData.url || ''}
                            onChange={(e) => onChange({ url: e.target.value })}
                            placeholder={hints[type as keyof typeof hints]}
                            className="font-mono"
                        />
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <RiInformationFill size={12} />
                            粘贴完整的媒体链接
                        </p>
                    </div>

                    <div>
                        <Label className="text-sm font-medium mb-2 block">标题</Label>
                        <Input
                            value={formData.title || ''}
                            onChange={(e) => onChange({ title: e.target.value })}
                            placeholder="媒体标题"
                        />
                    </div>

                    <div>
                        <Label className="text-sm font-medium mb-2 block">副标题（可选）</Label>
                        <Input
                            value={formData.subtitle || ''}
                            onChange={(e) => onChange({ subtitle: e.target.value })}
                            placeholder="描述信息"
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
                        <Label className="text-sm font-medium mb-2 block">RSS Feed URL</Label>
                        <Input
                            type="url"
                            value={formData.url || ''}
                            onChange={(e) => onChange({ url: e.target.value })}
                            placeholder="https://yourblog.com/rss"
                            className="font-mono"
                        />
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <RiInformationFill size={12} />
                            输入博客的 RSS 订阅地址
                        </p>
                    </div>

                    <div>
                        <Label className="text-sm font-medium mb-2 block">博客名称</Label>
                        <Input
                            value={formData.title || ''}
                            onChange={(e) => onChange({ title: e.target.value })}
                            placeholder="我的博客"
                        />
                    </div>
                </>
            );
        }

        // 标准链接卡片和其他社交媒体卡片
        return (
            <>
                <div>
                    <Label className="text-sm font-medium mb-2 block">标题</Label>
                    <Input
                        value={formData.title || ''}
                        onChange={(e) => onChange({ title: e.target.value })}
                        placeholder="卡片标题"
                    />
                </div>

                <div>
                    <Label className="text-sm font-medium mb-2 block">副标题（可选）</Label>
                    <Input
                        value={formData.subtitle || ''}
                        onChange={(e) => onChange({ subtitle: e.target.value })}
                        placeholder="补充说明"
                    />
                </div>

                <div>
                    <Label className="text-sm font-medium mb-2 block">链接地址</Label>
                    <Input
                        type="url"
                        value={formData.url || ''}
                        onChange={(e) => onChange({ url: e.target.value })}
                        placeholder="https://example.com"
                        className="font-mono"
                    />
                </div>

                <div>
                    <Label className="text-sm font-medium mb-2 block">按钮文字</Label>
                    <Input
                        value={formData.buttonText || ''}
                        onChange={(e) => onChange({ buttonText: e.target.value })}
                        placeholder="访问"
                    />
                </div>
            </>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <RiInformationFill size={16} className="text-blue-500" />
                <span>填写卡片的内容信息</span>
            </div>
            
            {renderContentFields()}
        </div>
    );
};

export default CardContentEditor;
