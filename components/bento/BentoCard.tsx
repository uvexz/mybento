import React from 'react';
import { motion } from 'framer-motion';
import { BentoCardProps, CardSize, CardType } from '@/lib/types';
import BlogCard from './BlogCard';
import ContactCard from './ContactCard';
import MastodonCard from './MastodonCard';
import GithubCard from './GithubCard';
import { useTranslations } from 'next-intl';
import {
    RiTwitterXFill,
    RiInstagramFill,
    RiGithubFill,
    RiLinksFill,
    RiImageFill,
    RiYoutubeFill,
    RiCupFill,
    RiBookOpenFill,
    RiFigmaFill,
    RiMusicFill,
    RiMapPinFill,
    RiMailFill,
    RiLinkedinBoxFill,
    RiCalendarFill,
    RiVideoFill,
    RiEmotionHappyFill,
    RiAnchorFill,
    RiHashtag,
    RiArrowLeftLine,
    RiArrowRightLine,
    RiEdit2Fill,
    RiSoundcloudFill,
    RiSpotifyFill,
    RiVimeoFill,
    RiMastodonFill,
    RiGroupLine,
    RiArchiveLine,
    RiStarLine,
    RiGitForkLine,
    RiCodeLine,
    RiArticleLine,
    RiDiscordFill,
    RiTwitchFill,
    RiTiktokFill,
    RiPinterestFill,
    RiSlackFill,
    RiDribbbleFill,
    RiBehanceFill,
    RiMediumFill,
    RiRedditFill,
    RiWhatsappFill,
    RiTelegramFill,
    RiWechatFill,
    RiQqFill,
    RiWeiboFill,
    RiSnapchatFill,
    RiPatreonFill,
    RiProductHuntFill,
    RiStackOverflowFill,
    RiNpmjsFill,
    RiAppleFill,
    RiAndroidFill,
    RiWindowsFill,
    RiChromeFill,
    RiFirefoxFill,
    RiSafariFill,
    RiEdgeFill,
    RiOperaFill,
    RiDragMoveFill,
} from '@remixicon/react';
import { cn } from '@/lib/utils';

import {
    RiHomeFill,
    RiBriefcaseFill,
    RiShoppingBagFill,
    RiGamepadFill,
    RiCameraFill,
    RiPaletteFill,
    RiCodeBoxFill,
    RiRocketFill,
    RiHeartFill,
    RiStarFill,
    RiFireFill,
    RiSunFill,
    RiMoonFill,
    RiLeafFill,
    RiFlowerFill,
    RiBugFill,
    RiGiftFill,
    RiTrophyFill,
    RiMedalFill,
    RiLightbulbFill,
    RiCompassFill,
    RiGlobalFill,
    RiShieldFill,
    RiToolsFill,
    RiSettings3Fill,
    RiNotificationFill,
    RiQuestionFill,
    RiInformationFill,
    RiAlertFill,
    RiCheckboxCircleFill,
    RiCloseCircleFill,
    RiAddCircleFill,
    RiSubtractFill,
    RiTimeFill,
    RiAlarmFill,
    RiDownloadCloudFill,
    RiUploadCloudFill,
    RiDatabaseFill,
    RiServerFill,
    RiTerminalBoxFill,
    RiSmartphoneFill,
    RiComputerFill,
    RiHeadphoneFill,
    RiMicFill,
    RiVolumeUpFill,
    RiMovieFill,
    RiFilmFill,
    RiGalleryFill,
    RiPriceTag3Fill,
    RiCoupon3Fill,
    RiWalletFill,
    RiBankCardFill,
    RiShoppingCartFill,
    RiStore2Fill,
    RiUserFill,
    RiTeamFill,
    RiUserHeartFill,
    RiUserStarFill,
    RiMessageFill,
    RiChatSmileFill,
    RiFeedbackFill,
    RiQuestionAnswerFill,
    RiPencilFill,
    RiDraftFill,
    RiFileTextFill,
    RiFilePaperFill,
    RiFolderFill,
    RiArchiveDrawerFill,
    RiInboxFill,
    RiSendPlaneFill,
    RiShareFill,
    RiExternalLinkFill,
    RiAttachmentFill,
    RiPushpinFill,
    RiBookmarkFill,
    RiFlagFill,
    RiEyeFill,
    RiEyeOffFill,
    RiSearchFill,
    RiZoomInFill,
    RiFilterFill,
    RiSortAsc,
    RiLayoutGridFill,
    RiLayoutMasonryFill,
    RiSideBarFill,
    RiMenuFill,
    RiMoreFill,
    RiRefreshFill,
    RiLoopLeftFill,
    RiRepeatFill,
    RiShuffleFill,
    RiPlayFill,
    RiPauseFill,
    RiStopFill,
    RiSkipForwardFill,
    RiSkipBackFill,
    RiVolumeDownFill,
    RiVolumeMuteFill,
    RiFullscreenFill,
    RiPictureInPictureFill,
    RiLockFill,
    RiLockUnlockFill,
    RiKeyFill,
    RiShieldCheckFill,
    RiEyeCloseFill,
    RiFingerprint2Fill,
    RiUserAddFill,
    RiUserFollowFill,
    RiUserUnfollowFill,
    RiLogoutBoxFill,
    RiLoginBoxFill,
} from '@remixicon/react';

// Icon mapping for dynamic rendering
export const ICON_MAP: Record<string, React.ElementType> = {
    // Social Media
    'twitter': RiTwitterXFill,
    'instagram': RiInstagramFill,
    'github': RiGithubFill,
    'youtube': RiYoutubeFill,
    'linkedin': RiLinkedinBoxFill,
    'mastodon': RiMastodonFill,
    'spotify': RiSpotifyFill,
    'soundcloud': RiSoundcloudFill,
    'vimeo': RiVimeoFill,
    'discord': RiDiscordFill,
    'twitch': RiTwitchFill,
    'tiktok': RiTiktokFill,
    'pinterest': RiPinterestFill,
    'slack': RiSlackFill,
    'dribbble': RiDribbbleFill,
    'behance': RiBehanceFill,
    'medium': RiMediumFill,
    'reddit': RiRedditFill,
    'whatsapp': RiWhatsappFill,
    'telegram': RiTelegramFill,
    'wechat': RiWechatFill,
    'qq': RiQqFill,
    'weibo': RiWeiboFill,
    'snapchat': RiSnapchatFill,
    'patreon': RiPatreonFill,
    'producthunt': RiProductHuntFill,
    'stackoverflow': RiStackOverflowFill,
    'npm': RiNpmjsFill,

    // Platforms & Browsers
    'apple': RiAppleFill,
    'android': RiAndroidFill,
    'windows': RiWindowsFill,
    'chrome': RiChromeFill,
    'firefox': RiFirefoxFill,
    'safari': RiSafariFill,
    'edge': RiEdgeFill,
    'opera': RiOperaFill,

    // Common
    'home': RiHomeFill,
    'link': RiLinksFill,
    'mail': RiMailFill,
    'phone': RiSmartphoneFill,
    'message': RiMessageFill,
    'chat': RiChatSmileFill,
    'feedback': RiFeedbackFill,
    'question-answer': RiQuestionAnswerFill,
    'user': RiUserFill,
    'team': RiTeamFill,
    'user-heart': RiUserHeartFill,
    'user-star': RiUserStarFill,
    'user-add': RiUserAddFill,
    'user-follow': RiUserFollowFill,
    'user-unfollow': RiUserUnfollowFill,
    'heart': RiHeartFill,
    'star': RiStarFill,
    'bookmark': RiBookmarkFill,
    'flag': RiFlagFill,
    'eye': RiEyeFill,
    'eye-off': RiEyeOffFill,
    'eye-close': RiEyeCloseFill,

    // Content & Files
    'book': RiBookOpenFill,
    'article': RiArticleLine,
    'blog': RiArticleLine,
    'pencil': RiPencilFill,
    'draft': RiDraftFill,
    'file': RiFileTextFill,
    'file-paper': RiFilePaperFill,
    'folder': RiFolderFill,
    'archive': RiArchiveDrawerFill,
    'inbox': RiInboxFill,
    'send': RiSendPlaneFill,
    'share': RiShareFill,
    'external-link': RiExternalLinkFill,
    'attachment': RiAttachmentFill,
    'pushpin': RiPushpinFill,

    // Media
    'image': RiImageFill,
    'gallery': RiGalleryFill,
    'camera': RiCameraFill,
    'video': RiVideoFill,
    'movie': RiMovieFill,
    'film': RiFilmFill,
    'music': RiMusicFill,
    'headphone': RiHeadphoneFill,
    'mic': RiMicFill,
    'volume': RiVolumeUpFill,
    'volume-down': RiVolumeDownFill,
    'volume-mute': RiVolumeMuteFill,
    'play': RiPlayFill,
    'pause': RiPauseFill,
    'stop': RiStopFill,
    'skip-forward': RiSkipForwardFill,
    'skip-back': RiSkipBackFill,
    'fullscreen': RiFullscreenFill,
    'picture-in-picture': RiPictureInPictureFill,

    // Work & Business
    'briefcase': RiBriefcaseFill,
    'shopping': RiShoppingBagFill,
    'cart': RiShoppingCartFill,
    'store': RiStore2Fill,
    'wallet': RiWalletFill,
    'card': RiBankCardFill,
    'tag': RiPriceTag3Fill,
    'coupon': RiCoupon3Fill,
    'gift': RiGiftFill,

    // Tech & Development
    'code': RiCodeBoxFill,
    'terminal': RiTerminalBoxFill,
    'database': RiDatabaseFill,
    'server': RiServerFill,
    'computer': RiComputerFill,
    'smartphone': RiSmartphoneFill,
    'tools': RiToolsFill,
    'settings': RiSettings3Fill,
    'download': RiDownloadCloudFill,
    'upload': RiUploadCloudFill,

    // Nature & Objects
    'coffee': RiCupFill,
    'fire': RiFireFill,
    'sun': RiSunFill,
    'moon': RiMoonFill,
    'leaf': RiLeafFill,
    'flower': RiFlowerFill,
    'bug': RiBugFill,
    'rocket': RiRocketFill,
    'trophy': RiTrophyFill,
    'medal': RiMedalFill,
    'lightbulb': RiLightbulbFill,
    'compass': RiCompassFill,
    'globe': RiGlobalFill,
    'shield': RiShieldFill,
    'shield-check': RiShieldCheckFill,
    'lock': RiLockFill,
    'lock-unlock': RiLockUnlockFill,
    'key': RiKeyFill,
    'fingerprint': RiFingerprint2Fill,

    // UI Elements
    'smile': RiEmotionHappyFill,
    'anchor': RiAnchorFill,
    'hash': RiHashtag,
    'calendar': RiCalendarFill,
    'time': RiTimeFill,
    'alarm': RiAlarmFill,
    'notification': RiNotificationFill,
    'question': RiQuestionFill,
    'info': RiInformationFill,
    'alert': RiAlertFill,
    'check': RiCheckboxCircleFill,
    'close': RiCloseCircleFill,
    'add': RiAddCircleFill,
    'subtract': RiSubtractFill,
    'search': RiSearchFill,
    'zoom-in': RiZoomInFill,
    'filter': RiFilterFill,
    'sort': RiSortAsc,
    'layout-grid': RiLayoutGridFill,
    'layout-masonry': RiLayoutMasonryFill,
    'sidebar': RiSideBarFill,
    'menu': RiMenuFill,
    'more': RiMoreFill,
    'refresh': RiRefreshFill,
    'loop': RiLoopLeftFill,
    'repeat': RiRepeatFill,
    'shuffle': RiShuffleFill,
    'logout': RiLogoutBoxFill,
    'login': RiLoginBoxFill,

    // Location & Map
    'map': RiMapPinFill,
    'location': RiMapPinFill,

    // Design
    'figma': RiFigmaFill,
    'palette': RiPaletteFill,
    'paint': RiPaletteFill,

    // Games
    'game': RiGamepadFill,
};

const BentoCard: React.FC<BentoCardProps> = ({
    id,
    title,
    subtitle,
    buttonText,
    icon,
    colorClass,
    customBgColor,
    customTextColor,
    size,
    type,
    url,
    imageUrl,
    githubData,
    contactInfo,
    mastodonData,
    articleContent,
    customComponent,
    onEdit,
    onMove,
    onArticleClick,
    isFirst,
    isLast,
    className = '',
    dragHandleProps,
    isDragging = false
}) => {
    const t = useTranslations();

    // GitHub card specific rendering
    const isGitHubCard = type === 'social-github' && githubData;

    // Blog card specific rendering
    const isBlogCard = type === 'blog-rss';

    // Contact card specific rendering
    const isContactCard = type.startsWith('contact-') && contactInfo;

    // Mastodon card specific rendering
    const isMastodonCard = type === 'social-mastodon';

    // Article card specific rendering
    const isArticleCard = type === 'article';
    
    // Highlights card specific rendering
    const isHighlightsCard = type === 'highlights';
    // Determine column span based on size
    const spanClasses = {
        [CardSize.Small]: 'sm:col-span-1 sm:row-span-1',
        [CardSize.Medium]: 'sm:col-span-2 sm:row-span-1',
        [CardSize.Tall]: 'sm:col-span-1 sm:row-span-2',
        [CardSize.Large]: 'sm:col-span-2 sm:row-span-2',
    }[size];

    // Adjust height logic
    const heightClass = (size === CardSize.Large || size === CardSize.Tall) ? 'h-[27rem]' : 'h-52';

    // Render Icon Helper
    const IconComponent = icon && ICON_MAP[icon] ? ICON_MAP[icon] : null;

    // Image Card Logic
    const isImageCard = type === 'image' || type === 'image-link';
    const isUniversalCard = type === 'universal';
    const hasBackgroundImage = (isImageCard || (isUniversalCard && imageUrl) || (isArticleCard && imageUrl) || (isHighlightsCard && imageUrl)) && imageUrl;
    const bgStyle = hasBackgroundImage ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};

    // Embed Card Logic
    const isEmbedCard = type.startsWith('video-') || type.startsWith('music-');
    const embedUrl = getEmbedUrl(type, url);

    // Click handler for links
    const handleClick = (e: React.MouseEvent) => {
        // If clicking actions, don't navigate
        if ((e.target as HTMLElement).closest('.action-btn')) return;

        // Article card opens modal
        if (isArticleCard && onArticleClick && articleContent) {
            onArticleClick({
                id,
                title,
                subtitle,
                content: articleContent
            });
            // Track click asynchronously
            fetch('/api/track-click', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cardId: id }),
            }).catch(error => {
                console.error('Failed to track click:', error);
            });
            return;
        }

        // Highlights card and other cards with URL
        if (url && type !== 'image' && !isEmbedCard) {
            // Open link immediately for better UX
            window.open(url, '_blank');

            // Track click asynchronously (don't wait for response)
            fetch('/api/track-click', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cardId: id }),
            }).catch(error => {
                console.error('Failed to track click:', error);
            });
        }
    };

    // Helper function to get embed URL
    function getEmbedUrl(cardType: CardType, originalUrl?: string): string | null {
        if (!originalUrl) return null;

        try {
            if (cardType === 'video-youtube') {
                const videoId = extractYouTubeId(originalUrl);
                return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
            }
            if (cardType === 'video-vimeo') {
                const videoId = extractVimeoId(originalUrl);
                return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
            }
            if (cardType === 'video-bilibili') {
                const bvid = extractBilibiliId(originalUrl);
                return bvid ? `https://player.bilibili.com/player.html?bvid=${bvid}&high_quality=1&autoplay=0` : null;
            }
            if (cardType === 'music-spotify') {
                const trackId = extractSpotifyId(originalUrl);
                return trackId ? `https://open.spotify.com/embed/track/${trackId}` : null;
            }
            if (cardType === 'music-soundcloud') {
                return `https://w.soundcloud.com/player/?url=${encodeURIComponent(originalUrl)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
            }
            if (cardType === 'music-netease') {
                const songId = extractNeteaseId(originalUrl);
                return songId ? `https://music.163.com/outchain/player?type=2&id=${songId}&auto=0&height=66` : null;
            }
        } catch (error) {
            console.error('Failed to parse embed URL:', error);
        }
        return null;
    }

    function extractYouTubeId(url: string): string | null {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
            /youtube\.com\/embed\/([^&\n?#]+)/,
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    }

    function extractVimeoId(url: string): string | null {
        const match = url.match(/vimeo\.com\/(\d+)/);
        return match ? match[1] : null;
    }

    function extractBilibiliId(url: string): string | null {
        // 支持 BV 号和 av 号
        const bvMatch = url.match(/(?:bilibili\.com\/video\/)?(BV[a-zA-Z0-9]+)/);
        if (bvMatch) return bvMatch[1];

        const avMatch = url.match(/(?:bilibili\.com\/video\/)?av(\d+)/);
        if (avMatch) return `av${avMatch[1]}`;

        return null;
    }

    function extractSpotifyId(url: string): string | null {
        const match = url.match(/spotify\.com\/track\/([^?]+)/);
        return match ? match[1] : null;
    }

    function extractNeteaseId(url: string): string | null {
        // 支持 music.163.com/song?id=xxx 和 music.163.com/#/song?id=xxx
        const match = url.match(/song\?id=(\d+)/);
        return match ? match[1] : null;
    }

    // 使用自定义颜色或默认样式
    const hasCustomColor = customBgColor || customTextColor;
    const cardStyle = hasCustomColor ? {
        ...bgStyle,
        backgroundColor: customBgColor || 'var(--glass-surface)',
        color: customTextColor || 'var(--foreground)'
    } : bgStyle;

    return (
        <motion.div
            layoutId={id}
            onClick={handleClick}
            whileHover={{ scale: 1.02, boxShadow: "var(--glass-shadow)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`
        ${spanClasses} ${heightClass} ${!isImageCard && !hasCustomColor ? colorClass : ''} ${isImageCard ? 'bg-gray-200' : ''} ${className} 
        rounded-3xl relative group transition-colors duration-300 
        ${url || isArticleCard || (isHighlightsCard && url) ? 'cursor-pointer' : ''} 
        overflow-hidden flex flex-col justify-between
        border border-[var(--glass-border)] bg-[var(--glass-surface)] backdrop-blur-md
        shadow-sm
      `}
            style={cardStyle}
        >

            {/* Action Overlay (Edit + Drag Handle) */}
            <div className="absolute top-3 right-3 z-50 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Drag Handle */}
                {dragHandleProps && (
                    <button
                        {...dragHandleProps}
                        className="action-btn p-2 bg-[var(--glass-surface)] backdrop-blur-md rounded-full shadow-sm hover:bg-[var(--glass-highlight)] text-foreground transition-colors border border-[var(--glass-border)] cursor-grab active:cursor-grabbing"
                        title="Drag to reorder"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <RiDragMoveFill size={14} />
                    </button>
                )}
                {/* Edit */}
                {onEdit && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="action-btn p-2 bg-[var(--glass-surface)] backdrop-blur-md rounded-full shadow-sm hover:bg-[var(--glass-highlight)] text-foreground transition-colors border border-[var(--glass-border)]"
                        title="Edit Card"
                    >
                        <RiEdit2Fill size={14} />
                    </button>
                )}
            </div>

            {/* Move Buttons (Left/Right) */}
            {onMove && (
                <div className="absolute top-3 left-3 z-50 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isFirst && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onMove(id, 'left'); }}
                            className="action-btn p-2 bg-[var(--glass-surface)] backdrop-blur-md rounded-full shadow-sm hover:bg-[var(--glass-highlight)] text-foreground transition-colors border border-[var(--glass-border)]"
                            title="Move Left"
                        >
                            <RiArrowLeftLine size={14} />
                        </button>
                    )}
                    {!isLast && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onMove(id, 'right'); }}
                            className="action-btn p-2 bg-[var(--glass-surface)] backdrop-blur-md rounded-full shadow-sm hover:bg-[var(--glass-highlight)] text-foreground transition-colors border border-[var(--glass-border)]"
                            title="Move Right"
                        >
                            <RiArrowRightLine size={14} />
                        </button>
                    )}
                </div>
            )}

            {/* Custom Background Elements (e.g. Graphs, Mockups) */}
            {customComponent && (
                <div className="absolute inset-0 z-0">
                    {customComponent}
                </div>
            )}

            {/* Dark Overlay for Image Cards to make text readable */}
            {(isImageCard || (isUniversalCard && imageUrl) || (isArticleCard && imageUrl) || (isHighlightsCard && imageUrl)) && (
                <div className="absolute inset-0 bg-black/30 transition-opacity hover:bg-black/40 z-0" />
            )}

            {/* Embed Content (Video/Music) */}
            {isEmbedCard && embedUrl && (
                <div className="absolute inset-0 z-10">
                    <iframe
                        src={embedUrl}
                        className="w-full h-full rounded-3xl"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            )}

            {/* Icon - Fixed at top right (except for special card types) */}
            {IconComponent && !isImageCard && !isContactCard && !isMastodonCard && !isArticleCard && !isUniversalCard && !isEmbedCard && !isGitHubCard && !isHighlightsCard && !(isUniversalCard && imageUrl) && (
                <div className="absolute top-4 right-4 z-20">
                    <IconComponent
                        size={28}
                        className="opacity-60"
                        style={{ color: 'inherit' }}
                    />
                </div>
            )}

            {/* Content Layer */}
            <div className={`relative ${isEmbedCard ? 'z-0' : 'z-10'} flex flex-col h-full ${(isBlogCard || isContactCard || isMastodonCard || isEmbedCard) ? 'p-0' : 'p-6'
                } ${isEmbedCard ? 'pointer-events-none' : ''}`}>

                {/* Mastodon Card Special Layout */}
                {isMastodonCard ? (
                    <MastodonCard
                        data={mastodonData}
                        title={title}
                    />
                ) : isHighlightsCard ? (
                    /* Highlights Card Layout - Centered content, no icon, no button */
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        {title && (
                            <h3 className={`font-bold text-2xl leading-tight tracking-tight ${(imageUrl) ? 'text-white text-shadow-md' : ''}`}>
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p className={`text-base font-medium mt-3 leading-relaxed ${(imageUrl) ? 'text-white/95 text-shadow-sm' : 'opacity-80'}`}>
                                {subtitle}
                            </p>
                        )}
                    </div>
                ) : isArticleCard ? (
                    /* Article Card Layout */
                    <div className="flex flex-col h-full">
                        <div className="flex items-start gap-3 mb-auto">
                            {IconComponent && (
                                <div className="flex-shrink-0">
                                    <IconComponent size={32} className={`opacity-70 ${imageUrl ? 'text-white' : ''}`} style={imageUrl ? {} : { color: 'inherit' }} />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-bold text-xl leading-tight mb-1 tracking-tight ${imageUrl ? 'text-white text-shadow-sm' : ''}`}>{title}</h3>
                                {subtitle && (
                                    <p className={`text-sm opacity-70 line-clamp-3 leading-relaxed ${imageUrl ? 'text-white/90' : ''}`}>{subtitle}</p>
                                )}
                            </div>
                        </div>
                        <div className="mt-auto pt-3">
                            <span className={`text-xs opacity-60 font-medium ${imageUrl ? 'text-white' : ''}`}>{t('article.readMore')}</span>
                        </div>
                    </div>
                ) : isContactCard ? (
                    <ContactCard
                        type={type}
                        title={title}
                        subtitle={subtitle}
                        encodedInfo={contactInfo}
                        colorClass={colorClass}
                    />
                ) : isBlogCard ? (
                    <BlogCard
                        rssUrl={url || ''}
                        title={title}
                        colorClass={colorClass}
                        isImageCard={isImageCard}
                    />
                ) : isGitHubCard ? (
                    <GithubCard data={githubData} />
                ) : (
                    /* Regular Card Layout (includes universal and text types) */
                    <div className="flex justify-between items-start mb-auto">
                        <div className="flex flex-col gap-1 w-full pr-8">
                            {(title || subtitle) && (
                                <div className={(isImageCard || (isUniversalCard && imageUrl)) ? 'mt-auto text-white' : ''}>
                                    {title && (
                                        <h3 className={`font-bold text-xl leading-tight flex items-center gap-2 tracking-tight ${(isImageCard || (isUniversalCard && imageUrl)) ? 'text-white text-shadow-sm' : ''}`}>
                                            {/* 通用卡片的图标显示在标题同一行 */}
                                            {isUniversalCard && IconComponent && (
                                                <IconComponent
                                                    size={20}
                                                    className="flex-shrink-0"
                                                    style={{ color: 'inherit' }}
                                                />
                                            )}
                                            <span>{title}</span>
                                        </h3>
                                    )}
                                    {subtitle && (
                                        <p className={`text-sm font-medium mt-1 leading-relaxed ${(isImageCard || (isUniversalCard && imageUrl)) ? 'text-white/90' : 'opacity-70'}`}>
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )
                }

                {/* Footer: Action Button */}
                {
                    buttonText && buttonText.trim() && !customComponent && !isGitHubCard && !isContactCard && !isMastodonCard && !isArticleCard && !isHighlightsCard && (
                        <div className="mt-4">
                            <button className={`py-2 px-6 rounded-xl font-semibold text-sm w-full sm:w-auto shadow-sm transition-colors ${(isImageCard || (isUniversalCard && imageUrl))
                                ? 'bg-white/20 hover:bg-white/50 text-white backdrop-blur-md border border-white/30'
                                : 'bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] backdrop-blur-sm border border-[var(--glass-border)]'
                                }`}>
                                {buttonText}
                            </button>
                        </div>
                    )
                }
            </div >
        </motion.div >
    );
};

export default BentoCard;
