'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RiImageLine, RiUploadLine, RiDeleteBinLine, RiFileCopyLine, RiCheckLine, RiLoader4Line, RiCloseLine } from '@remixicon/react';
import { Button } from './ui/button';
import { useTranslations } from 'next-intl';

interface UserImage {
    id: number;
    url: string;
    filename: string;
    size: number;
    type: string;
    usedIn: string | null;
    createdAt: string;
}

const ImageGallery: React.FC = () => {
    const t = useTranslations();
    const [images, setImages] = useState<UserImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        try {
            const res = await fetch('/api/images');
            if (res.ok) {
                const data = await res.json();
                setImages(data.images);
            }
        } catch (error) {
            console.error('Failed to load images:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert(t('imageGallery.invalidFileType'));
            return;
        }

        // Validate file size (5MB default)
        if (file.size > 5 * 1024 * 1024) {
            alert(t('imageGallery.fileTooLarge'));
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/images', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                await loadImages();
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                const data = await res.json();
                alert(data.error || t('imageGallery.uploadFailed'));
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert(t('imageGallery.uploadFailed'));
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('imageGallery.deleteConfirm'))) return;

        try {
            const res = await fetch(`/api/images?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setImages(images.filter(img => img.id !== id));
            } else {
                alert(t('imageGallery.deleteFailed'));
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert(t('imageGallery.deleteFailed'));
        }
    };

    const handleCopy = async (url: string, id: number) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (error) {
            console.error('Copy error:', error);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <RiLoader4Line className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Upload Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('imageGallery.title')}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        {t('imageGallery.totalImages', { count: images.length })}
                    </p>
                </div>
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        className="hidden"
                        disabled={uploading}
                    />
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <RiLoader4Line className="animate-spin" size={18} />
                                {t('imageGallery.uploading')}
                            </>
                        ) : (
                            <>
                                <RiUploadLine size={18} />
                                {t('imageGallery.uploadImage')}
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Images Grid */}
            {images.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <RiImageLine size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">{t('imageGallery.noImages')}</p>
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        disabled={uploading}
                    >
                        <RiUploadLine size={18} className="mr-2" />
                        {t('imageGallery.uploadFirst')}
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((image) => (
                        <div
                            key={image.id}
                            className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                        >
                            {/* Image */}
                            <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                <img
                                    src={image.url}
                                    alt={image.filename}
                                    className="w-full h-full object-cover"
                                />
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => handleCopy(image.url, image.id)}
                                        className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                                        title={t('imageGallery.copyUrl')}
                                    >
                                        {copiedId === image.id ? (
                                            <RiCheckLine size={20} className="text-green-600" />
                                        ) : (
                                            <RiFileCopyLine size={20} className="text-gray-700" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(image.id)}
                                        className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
                                        title={t('imageGallery.delete')}
                                    >
                                        <RiDeleteBinLine size={20} className="text-red-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-3">
                                <p className="text-xs font-medium text-gray-900 truncate" title={image.filename}>
                                    {image.filename}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-gray-500">{formatFileSize(image.size)}</span>
                                    {image.usedIn && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                            {image.usedIn}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageGallery;
