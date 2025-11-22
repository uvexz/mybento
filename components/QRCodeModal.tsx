'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RiCloseLine, RiDownloadLine } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import QRCode from 'qrcode';
import { useTranslations } from 'next-intl';

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title: string;
    username?: string;
}

export default function QRCodeModal({ isOpen, onClose, url, title, username }: QRCodeModalProps) {
    const t = useTranslations();
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen && url) {
            QRCode.toDataURL(url, {
                width: 400,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            })
                .then(setQrCodeDataUrl)
                .catch(console.error);
        }
    }, [isOpen, url]);

    const handleDownload = () => {
        const a = document.createElement('a');
        a.href = qrCodeDataUrl;
        // Use username if available, otherwise fall back to title
        const filename = username || title.replace(/\s+/g, '-').toLowerCase();
        a.download = `qrcode-${filename}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (!isOpen || !mounted) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{t('qrcode.title')}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <RiCloseLine size={20} />
                    </button>
                </div>

                <div className="flex flex-col items-center space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        {t('qrcode.scanText')} <strong>{username || title}</strong>
                    </p>

                    {qrCodeDataUrl && (
                        <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
                            <img src={qrCodeDataUrl} alt="QR Code" className="w-64 h-64" />
                        </div>
                    )}

                    <Button onClick={handleDownload} className="w-full">
                        <RiDownloadLine className="w-4 h-4 mr-2" />
                        {t('qrcode.download')}
                    </Button>

                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center break-all">
                        {url}
                    </p>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
