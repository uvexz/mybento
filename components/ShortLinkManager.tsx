'use client';

import { useState, useEffect } from 'react';
import { RiLinksFill, RiFileCopyLine, RiDeleteBinLine, RiAddLine, RiExternalLinkLine } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ShortLink {
    id: number;
    shortCode: string;
    originalUrl: string;
    title: string | null;
    clicks: number;
    createdAt: string;
}

export default function ShortLinkManager() {
    const [links, setLinks] = useState<ShortLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        originalUrl: '',
        title: '',
        customCode: '',
    });

    const siteUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    useEffect(() => {
        loadLinks();
    }, []);

    const loadLinks = async () => {
        try {
            const response = await fetch('/api/short-links');
            const data = await response.json();
            if (data.links) {
                setLinks(data.links);
            }
        } catch (error) {
            console.error('Failed to load links:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            const response = await fetch('/api/short-links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Failed to create short link');
                return;
            }

            setFormData({ originalUrl: '', title: '', customCode: '' });
            setShowForm(false);
            loadLinks();
        } catch (error) {
            console.error('Create error:', error);
            alert('Failed to create short link');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this short link?')) return;

        try {
            await fetch(`/api/short-links?id=${id}`, { method: 'DELETE' });
            loadLinks();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    if (isLoading) {
        return <div className="text-gray-500">Loading...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <RiLinksFill className="w-5 h-5" />
                        Short Links
                    </CardTitle>
                    <Button size="sm" onClick={() => setShowForm(!showForm)}>
                        <RiAddLine className="w-4 h-4 mr-2" />
                        New Link
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {showForm && (
                    <form onSubmit={handleCreate} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
                        <div>
                            <Label>Original URL *</Label>
                            <Input
                                type="url"
                                value={formData.originalUrl}
                                onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
                                placeholder="https://example.com/very/long/url"
                                required
                            />
                        </div>
                        <div>
                            <Label>Title (optional)</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="My Link"
                            />
                        </div>
                        <div>
                            <Label>Custom Code (optional)</Label>
                            <Input
                                value={formData.customCode}
                                onChange={(e) => setFormData({ ...formData, customCode: e.target.value })}
                                placeholder="mycode"
                                pattern="[a-zA-Z0-9]+"
                            />
                            <p className="text-xs text-gray-500 mt-1">Leave empty for random code</p>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={isCreating}>
                                {isCreating ? 'Creating...' : 'Create'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}

                <div className="space-y-3">
                    {links.length === 0 ? (
                        <p className="text-gray-500 text-sm">No short links yet</p>
                    ) : (
                        links.map((link) => (
                            <div key={link.id} className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm">
                                            {link.title || 'Untitled'}
                                        </h4>
                                        <a
                                            href={`/s/${link.shortCode}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                                        >
                                            {siteUrl}/s/{link.shortCode}
                                            <RiExternalLinkLine className="w-3 h-3" />
                                        </a>
                                        <p className="text-xs text-gray-500 truncate mt-1">
                                            → {link.originalUrl}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copyToClipboard(`${siteUrl}/s/${link.shortCode}`)}
                                        >
                                            <RiFileCopyLine className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(link.id)}
                                        >
                                            <RiDeleteBinLine className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {link.clicks} clicks
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
