'use client';

import React, { useState } from 'react';
import { RiMailFill, RiPhoneFill, RiQqFill, RiWechatFill, RiTelegramFill, RiFileCopyLine, RiCheckLine, RiEyeFill, RiEyeOffFill, RiLockFill, RiLockUnlockFill } from '@remixicon/react';
import { CardType } from '@/lib/types';

interface ContactCardProps {
    type: CardType;
    title: string;
    subtitle?: string;
    encodedInfo: string; // Base64 encoded contact info
    colorClass: string;
}

// Decode contact info from base64
const decodeContactInfo = (encoded: string): string => {
    try {
        return atob(encoded);
    } catch {
        return '';
    }
};

// Obfuscate contact info for display
const obfuscateInfo = (info: string, type: CardType): string => {
    if (!info) return '';
    
    if (type === 'contact-email') {
        const [local, domain] = info.split('@');
        if (!domain) return info;
        const visibleLocal = local.length > 3 ? local.slice(0, 3) + '***' : '***';
        const [domainName, tld] = domain.split('.');
        const visibleDomain = domainName.length > 2 ? domainName.slice(0, 2) + '***' : '***';
        return `${visibleLocal}@${visibleDomain}.${tld}`;
    }
    
    if (type === 'contact-phone') {
        if (info.length > 7) {
            return info.slice(0, 3) + '****' + info.slice(-4);
        }
        return '***' + info.slice(-4);
    }
    
    // For QQ, WeChat, Telegram - show first 3 and last 2 characters
    if (info.length > 5) {
        return info.slice(0, 3) + '***' + info.slice(-2);
    }
    return '***' + info.slice(-2);
};

const ContactCard: React.FC<ContactCardProps> = ({ type, title, subtitle, encodedInfo, colorClass }) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    
    const contactInfo = decodeContactInfo(encodedInfo);
    const displayInfo = isRevealed ? contactInfo : obfuscateInfo(contactInfo, type);

    const getIcon = () => {
        switch (type) {
            case 'contact-email': return <RiMailFill size={20} />;
            case 'contact-phone': return <RiPhoneFill size={20} />;
            case 'contact-qq': return <RiQqFill size={20} />;
            case 'contact-wechat': return <RiWechatFill size={20} />;
            case 'contact-telegram': return <RiTelegramFill size={20} />;
            default: return <RiMailFill size={20} />;
        }
    };

    const getActionText = () => {
        switch (type) {
            case 'contact-email': return 'Email Me';
            case 'contact-phone': return 'Call Me';
            case 'contact-qq': return 'Add QQ';
            case 'contact-wechat': return 'Add WeChat';
            case 'contact-telegram': return 'Message';
            default: return 'Contact';
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(contactInfo);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleRevealToggle = () => {
        setIsRevealed(!isRevealed);
    };

    const handleAction = () => {
        if (type === 'contact-email') {
            window.location.href = `mailto:${contactInfo}`;
        } else if (type === 'contact-phone') {
            window.location.href = `tel:${contactInfo}`;
        } else if (type === 'contact-telegram') {
            window.open(`https://t.me/${contactInfo}`, '_blank');
        } else {
            // For QQ and WeChat, just copy to clipboard
            handleCopy();
        }
    };

    return (
        <div className="h-full flex flex-col justify-between p-6">
            {/* Header */}
            <div>
                <h3 className="font-bold text-lg mb-1 line-clamp-2">{title}</h3>
                {subtitle && (
                    <p className="text-sm opacity-90 line-clamp-2">{subtitle}</p>
                )}
            </div>

            {/* Contact Info Display - Protected */}
            <div className="my-4">
                <div 
                    className="bg-black/10 backdrop-blur-sm rounded-lg p-3 font-mono text-sm select-none"
                    onContextMenu={(e) => e.preventDefault()} // Prevent right-click
                    style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                >
                    <div className="flex items-center gap-3">
                        {/* Icon on the left */}
                        <div className="flex-shrink-0 opacity-80">
                            {getIcon()}
                        </div>
                        {/* Contact info in the middle */}
                        <span className="flex-1 truncate">
                            {displayInfo || '***'}
                        </span>
                        {/* Eye button on the right */}
                        <button
                            onClick={handleRevealToggle}
                            className="p-1.5 hover:bg-white/20 rounded transition-colors flex-shrink-0"
                            title={isRevealed ? 'Hide' : 'Reveal'}
                        >
                            {isRevealed ? <RiEyeOffFill size={16} /> : <RiEyeFill size={16} />}
                        </button>
                    </div>
                </div>
                <p className="text-xs opacity-70 mt-2 text-center flex items-center justify-center gap-1">
                    {isRevealed ? (
                        <>
                            <RiLockUnlockFill size={12} />
                            Info revealed
                        </>
                    ) : (
                        <>
                            <RiLockFill size={12} />
                            Click eye to reveal
                        </>
                    )}
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={handleAction}
                    className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg py-2.5 px-4 font-semibold text-sm transition-all"
                >
                    {getActionText()}
                </button>
                <button
                    onClick={handleCopy}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg py-2.5 px-3 transition-all flex items-center justify-center"
                    title="Copy to clipboard"
                >
                    {isCopied ? (
                        <RiCheckLine size={18} className="text-green-300" />
                    ) : (
                        <RiFileCopyLine size={18} />
                    )}
                </button>
            </div>
        </div>
    );
};

export default ContactCard;
