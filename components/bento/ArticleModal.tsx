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
                    <article className="prose prose-lg prose-slate dark:prose-invert max-w-none 
                        prose-headings:scroll-mt-28 prose-headings:font-bold
                        prose-h1:text-3xl prose-h1:mb-2 prose-h1:mt-2
                        prose-h2:text-2xl prose-h2:mb-2 prose-h2:mt-2
                        prose-h3:text-2xl prose-h3:mb-2 prose-h3:mt-2
                        prose-h4:text-xl prose-h4:mb-2 prose-h4:mt-4
                        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                        prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
                        prose-strong:text-gray-900 prose-strong:font-semibold
                        prose-em:text-gray-700 prose-em:italic
                        prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                        prose-pre:bg-pink-50 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:shadow-lg prose-pre:overflow-x-auto
                        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:pl-4 prose-blockquote:pr-4 prose-blockquote:py-2 prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:rounded-r-lg
                        prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
                        prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
                        prose-li:text-gray-700 prose-li:mb-1
                        prose-img:rounded-xl prose-img:shadow-md prose-img:my-6
                        prose-hr:border-gray-300 prose-hr:my-8
                        prose-table:border-collapse prose-table:w-full
                        prose-th:bg-gray-100 prose-th:border prose-th:border-gray-300 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold
                        prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </article>
                </div>
            </div>
        </div>
    );
}
