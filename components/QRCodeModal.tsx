'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QRCode from 'qrcode';

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title: string;
}

export default function QRCodeModal({ isOpen, onClose, url, title }: QRCodeModalProps) {
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

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
        a.download = `qrcode-${title.replace(/\s+/g, '-').toLowerCase()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">QR Code</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col items-center space-y-4">
                    <p className="text-sm text-gray-600 text-center">
                        Scan this QR code to visit: <strong>{title}</strong>
                    </p>

                    {qrCodeDataUrl && (
                        <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
                            <img src={qrCodeDataUrl} alt="QR Code" className="w-64 h-64" />
                        </div>
                    )}

                    <Button onClick={handleDownload} className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download QR Code
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                        {url}
                    </p>
                </div>
            </div>
        </div>
    );
}
