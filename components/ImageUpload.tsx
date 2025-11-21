'use client';

import { useState, useRef } from 'react';
import { RiUploadLine, RiLoader4Line, RiCloseLine } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    folder?: 'avatars' | 'cards' | 'backgrounds';
    placeholder?: string;
}

export default function ImageUpload({ value, onChange, folder = 'cards', placeholder = 'Image URL or upload' }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            onChange(data.url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1"
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-shrink-0"
                >
                    {isUploading ? (
                        <RiLoader4Line className="w-4 h-4 animate-spin" />
                    ) : (
                        <RiUploadLine className="w-4 h-4" />
                    )}
                </Button>
                {value && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onChange('')}
                        className="flex-shrink-0"
                    >
                        <RiCloseLine className="w-4 h-4" />
                    </Button>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
            />

            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}

            {value && (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img src={value} alt="Preview" loading="lazy" className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
                        Preview
                    </div>
                </div>
            )}
        </div>
    );
}
