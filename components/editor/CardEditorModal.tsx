import React, { useState, useEffect } from 'react';
import { BentoCardProps, CardSize, CardType } from '@/lib/types';
import { ICON_MAP } from '@/components/bento/BentoCard';
import { X, Trash2, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUpload from '@/components/ImageUpload';

interface CardEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (card: BentoCardProps) => void;
    onDelete: (id: string) => void;
    initialData: BentoCardProps | null;
}

const COLORS = [
    { name: 'Twitter Blue', class: 'bg-[#1DA1F2] text-white' },
    { name: 'Substack Orange', class: 'bg-[#FF6719] text-white' },
    { name: 'Youtube Red', class: 'bg-[#FF0000] text-white' },
    { name: 'Coffee Yellow', class: 'bg-[#FFDD00] text-black' },
    { name: 'Github Green', class: 'bg-[#2dba4e] text-white' },
    { name: 'Mastodon Blue', class: 'bg-[#6364FF] text-white' },
    { name: 'Figma Purple', class: 'bg-[#A259FF] text-white' },
    { name: 'White', class: 'bg-white text-black' },
    { name: 'Gray', class: 'bg-gray-100 text-black' },
    { name: 'Dark', class: 'bg-gray-800 text-white' },
];

// Presets for smart auto-fill
const TYPE_PRESETS: Partial<Record<CardType, Partial<BentoCardProps>>> = {
    'social-x': { icon: 'twitter', colorClass: 'bg-[#1DA1F2] text-white', buttonText: 'Follow' },
    'social-insta': { icon: 'instagram', colorClass: 'bg-white text-black', buttonText: 'Follow' },
    'social-github': { icon: 'github', colorClass: 'bg-[#2dba4e] text-white', buttonText: 'Follow' },
    'social-youtube': { icon: 'youtube', colorClass: 'bg-[#FF0000] text-white', buttonText: 'Subscribe' },
    'social-mastodon': { icon: 'mastodon', colorClass: 'bg-[#6364FF] text-white', buttonText: 'Follow' },
    'social-linkedin': { icon: 'linkedin', colorClass: 'bg-[#0A66C2] text-white', buttonText: 'Connect' },
    'image': { icon: undefined, buttonText: '' },
    'image-link': { icon: undefined, buttonText: 'Visit' },
    'video-youtube': { icon: 'youtube', colorClass: 'bg-[#FF0000] text-white', buttonText: 'Watch', size: CardSize.Large },
    'video-vimeo': { icon: 'link', colorClass: 'bg-[#1AB7EA] text-white', buttonText: 'Watch', size: CardSize.Large },
    'music-spotify': { icon: 'music', colorClass: 'bg-[#1DB954] text-white', buttonText: 'Listen', size: CardSize.Medium },
    'music-soundcloud': { icon: 'music', colorClass: 'bg-[#FF5500] text-white', buttonText: 'Listen', size: CardSize.Medium },
    'email-form': { icon: 'mail', colorClass: 'bg-blue-500 text-white', buttonText: 'Subscribe', size: CardSize.Medium },
    'calendar': { icon: 'calendar', colorClass: 'bg-purple-500 text-white', buttonText: 'Book', size: CardSize.Medium },
};

const CardEditorModal: React.FC<CardEditorModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData }) => {
    const [formData, setFormData] = useState<Partial<BentoCardProps>>({
        title: '',
        subtitle: '',
        buttonText: '',
        url: '',
        type: 'link',
        size: CardSize.Small,
        colorClass: 'bg-white',
        icon: 'link',
    });

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    id: crypto.randomUUID(),
                    title: '',
                    subtitle: '',
                    buttonText: 'Visit',
                    url: '',
                    type: 'link',
                    size: CardSize.Small,
                    colorClass: 'bg-gray-100',
                    icon: 'link',
                    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop'
                });
            }
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleTypeChange = (newType: CardType) => {
        const preset = TYPE_PRESETS[newType];
        setFormData(prev => ({
            ...prev,
            type: newType,
            // Merge preset values if they exist, otherwise keep current or default
            icon: preset?.icon || (newType === 'link' ? 'link' : prev.icon),
            colorClass: preset?.colorClass || prev.colorClass,
            buttonText: preset?.buttonText !== undefined ? preset.buttonText : prev.buttonText,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Clean up data
        const cleanData = { ...formData };
        if (cleanData.type !== 'image' && cleanData.type !== 'image-link') {
            delete cleanData.imageUrl;
        }
        onSave(cleanData as BentoCardProps);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {initialData ? <LayoutTemplate size={20} className="text-blue-500" /> : <LayoutTemplate size={20} className="text-green-500" />}
                        {initialData ? 'Edit Card' : 'New Card'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">

                    {/* Section 1: Type & Size */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <Label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Card Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => handleTypeChange(value as CardType)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Basic</SelectLabel>
                                        <SelectItem value="link">Standard Link</SelectItem>
                                        <SelectItem value="image">Image Only</SelectItem>
                                        <SelectItem value="image-link">Image with Link</SelectItem>
                                    </SelectGroup>
                                    <SelectGroup>
                                        <SelectLabel>Social</SelectLabel>
                                        <SelectItem value="social-x">X / Twitter</SelectItem>
                                        <SelectItem value="social-insta">Instagram</SelectItem>
                                        <SelectItem value="social-github">GitHub</SelectItem>
                                        <SelectItem value="social-youtube">YouTube</SelectItem>
                                        <SelectItem value="social-linkedin">LinkedIn</SelectItem>
                                        <SelectItem value="social-mastodon">Mastodon</SelectItem>
                                    </SelectGroup>
                                    <SelectGroup>
                                        <SelectLabel>Media</SelectLabel>
                                        <SelectItem value="video-youtube">YouTube Video</SelectItem>
                                        <SelectItem value="video-vimeo">Vimeo Video</SelectItem>
                                        <SelectItem value="music-spotify">Spotify Track</SelectItem>
                                        <SelectItem value="music-soundcloud">SoundCloud</SelectItem>
                                    </SelectGroup>
                                    <SelectGroup>
                                        <SelectLabel>Interactive</SelectLabel>
                                        <SelectItem value="email-form">Email Subscription</SelectItem>
                                        <SelectItem value="calendar">Calendar/Booking</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Size</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { s: CardSize.Small, label: '1x1', h: 'h-8' },
                                    { s: CardSize.Medium, label: '2x1', h: 'h-8' },
                                    { s: CardSize.Tall, label: '1x2', h: 'h-12' },
                                    { s: CardSize.Large, label: '2x2', h: 'h-12' },
                                ].map((opt) => (
                                    <label
                                        key={opt.s}
                                        className={`
                      cursor-pointer border rounded-lg flex flex-col items-center justify-center gap-1 transition-all p-2
                      ${formData.size === opt.s
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }
                    `}
                                    >
                                        <input type="radio" name="size" className="hidden" checked={formData.size === opt.s} onChange={() => setFormData({ ...formData, size: opt.s })} />
                                        <div className={`w-full bg-current rounded-sm opacity-40 ${opt.h}`}></div>
                                        <span className="text-[10px] font-bold">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Section 2: Content */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-baseline">
                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Content</Label>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {(formData.type === 'image' || formData.type === 'image-link') ? (
                                <ImageUpload
                                    value={formData.imageUrl || ''}
                                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                                    folder="cards"
                                    placeholder="Image URL or upload (max 5MB)"
                                />
                            ) : null}

                            {/* Help text for embed types */}
                            {formData.type === 'video-youtube' && (
                                <p className="text-xs text-gray-500">
                                    💡 Paste YouTube video URL (e.g., https://youtube.com/watch?v=...)
                                </p>
                            )}
                            {formData.type === 'video-vimeo' && (
                                <p className="text-xs text-gray-500">
                                    💡 Paste Vimeo video URL (e.g., https://vimeo.com/123456789)
                                </p>
                            )}
                            {formData.type === 'music-spotify' && (
                                <p className="text-xs text-gray-500">
                                    💡 Paste Spotify track URL (e.g., https://open.spotify.com/track/...)
                                </p>
                            )}
                            {formData.type === 'music-soundcloud' && (
                                <p className="text-xs text-gray-500">
                                    💡 Paste SoundCloud track URL
                                </p>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <Input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Title (e.g. My Blog)"
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <Input
                                        type="text"
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                        placeholder="Subtitle (Optional)"
                                    />
                                </div>
                            </div>

                            {formData.type !== 'image' && (
                                <Input
                                    type="url"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    className="font-mono text-sm"
                                    placeholder="URL (https://example.com)"
                                />
                            )}

                            {/* Link URL for Image-Link type */}
                            {formData.type === 'image-link' && (
                                <Input
                                    type="url"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    className="font-mono text-sm"
                                    placeholder="Link Destination URL"
                                />
                            )}

                            {formData.type !== 'image' && (
                                <Input
                                    type="text"
                                    value={formData.buttonText}
                                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                                    placeholder="Button Text (e.g. Follow)"
                                />
                            )}
                        </div>
                    </div>

                    {/* Section 3: Visuals (Only for non-image cards) */}
                    {formData.type !== 'image' && formData.type !== 'image-link' && (
                        <>
                            <hr className="border-gray-100" />
                            <div>
                                <Label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Appearance</Label>

                                <div className="space-y-4">
                                    {/* Colors */}
                                    <div className="flex flex-wrap gap-3">
                                        {COLORS.map((c) => (
                                            <button
                                                key={c.name}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, colorClass: c.class })}
                                                className={`
                          w-10 h-10 rounded-full shadow-sm transition-transform hover:scale-110 flex items-center justify-center
                          ${c.class.includes('bg-white') || c.class.includes('bg-gray-100') ? 'border border-gray-200' : 'border-transparent'} 
                          ${formData.colorClass === c.class ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''}
                        `}
                                                style={!c.class.startsWith('bg-') ? { backgroundColor: c.class.split(' ')[0] } : undefined}
                                                title={c.name}
                                            >
                                                <div className={`w-full h-full rounded-full ${c.class}`}></div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Icons */}
                                    <div className="border border-gray-100 rounded-xl p-3 bg-gray-50 max-h-32 overflow-y-auto grid grid-cols-6 sm:grid-cols-8 gap-2">
                                        {Object.keys(ICON_MAP).map((iconKey) => {
                                            const IconComp = ICON_MAP[iconKey];
                                            return (
                                                <button
                                                    key={iconKey}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, icon: iconKey })}
                                                    className={`
                            aspect-square rounded-lg flex items-center justify-center transition-all
                            ${formData.icon === iconKey ? 'bg-white shadow-md text-blue-600 ring-1 ring-blue-100' : 'text-gray-400 hover:bg-white hover:text-gray-700'}
                          `}
                                                    title={iconKey}
                                                >
                                                    <IconComp size={18} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-2 flex gap-3 sticky bottom-0 bg-white pb-2 border-t border-gray-100 mt-6">
                        <Button
                            type="submit"
                            className="flex-1"
                        >
                            Save Changes
                        </Button>
                        {initialData && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => onDelete(initialData.id)}
                                title="Delete Card"
                            >
                                <Trash2 size={20} />
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CardEditorModal;
