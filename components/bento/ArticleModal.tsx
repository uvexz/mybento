'use client';

import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { RiCloseLine } from '@remixicon/react';
import { useTranslations } from 'next-intl';

interface ArticleModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    content: string;
}

export default function ArticleModal({ isOpen, onClose, title, subtitle, content }: ArticleModalProps) {
    const t = useTranslations();
    
    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex-1 pr-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
                        {subtitle && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        aria-label={t('common.close')}
                    >
                        <RiCloseLine size={24} className="text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-gray-50 dark:bg-gray-800">
                    <article className="prose">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </article>
                </div>
            </div>
        </div>
    );
}
