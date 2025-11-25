'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RiCloseLine, RiSaveLine, RiLoader4Line } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { createPage } from '@/lib/actions';
import { useRouter } from 'next/navigation';

interface AddPageModalProps {
    isOpen: boolean;
    onClose: () => void;
    username: string;
}

export default function AddPageModal({ isOpen, onClose, username }: AddPageModalProps) {
    const t = useTranslations();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleSave = async () => {
        if (!title || !slug) {
            setError(t('pages.titleRequired'));
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            const result = await createPage({ title, slug });
            if (result.success) {
                onClose();
                router.refresh();
                router.push(`/${username}/${slug}`);
            } else {
                setError(result.error || t('pages.createFailed'));
            }
        } catch (err) {
            setError(t('common.error'));
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !mounted) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{t('pages.addNewPage')}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <RiCloseLine size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="page-title">{t('pages.pageTitle')}</Label>
                        <Input
                            id="page-title"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (!slug) {
                                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                                }
                            }}
                            placeholder={t('pages.pageTitlePlaceholder')}
                        />
                    </div>
                    <div>
                        <Label htmlFor="page-slug">{t('pages.urlSlug')}</Label>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-sm">/{username}/</span>
                            <Input
                                id="page-slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                                placeholder={t('pages.urlSlugPlaceholder')}
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={onClose} disabled={isSaving}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <RiLoader4Line className="w-4 h-4 mr-2 animate-spin" /> : <RiSaveLine className="w-4 h-4 mr-2" />}
                            {t('pages.createPage')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
