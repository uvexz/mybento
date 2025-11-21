'use client';

import { useEffect, useState } from 'react';
import { RiArticleLine, RiLoader4Line } from '@remixicon/react';
import { BlogPost } from '@/lib/types';

interface BlogCardProps {
    rssUrl: string;
    title: string;
    colorClass: string;
    isImageCard: boolean;
}

export default function BlogCard({ rssUrl, title, colorClass, isImageCard }: BlogCardProps) {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            if (!rssUrl) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/blog-rss?url=${encodeURIComponent(rssUrl)}`);
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.details || 'Failed to fetch RSS feed');
                }

                const xmlText = await response.text();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
                
                // Check for parsing errors
                const parserError = xmlDoc.querySelector('parsererror');
                if (parserError) {
                    throw new Error('Invalid RSS feed format');
                }
                
                // Try both RSS and Atom formats
                let items = xmlDoc.querySelectorAll('item');
                if (items.length === 0) {
                    items = xmlDoc.querySelectorAll('entry'); // Atom format
                }
                
                const parsedPosts: BlogPost[] = [];

                items.forEach((item, index) => {
                    if (index >= 3) return; // Only get 3 latest posts
                    
                    // RSS format
                    const titleEl = item.querySelector('title');
                    const linkEl = item.querySelector('link');
                    const pubDateEl = item.querySelector('pubDate, published, updated');
                    
                    if (titleEl) {
                        // Try to get link from different formats
                        let link = linkEl?.textContent?.trim() || '';
                        
                        // Atom format: link is in href attribute
                        if (!link && linkEl) {
                            link = linkEl.getAttribute('href') || '';
                        }
                        
                        if (link) {
                            parsedPosts.push({
                                title: titleEl.textContent || '',
                                link: link,
                                pubDate: pubDateEl?.textContent || undefined,
                            });
                        }
                    }
                });

                if (parsedPosts.length === 0) {
                    throw new Error('No posts found in feed');
                }

                setPosts(parsedPosts);
            } catch (err) {
                console.error('Failed to fetch blog posts:', err);
                setError(err instanceof Error ? err.message : 'Could not load posts');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, [rssUrl]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white/80 p-6">
                <RiLoader4Line size={24} className="animate-spin mb-2" />
                <p className="text-sm">Loading posts...</p>
            </div>
        );
    }

    if (error || posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white/60 p-6">
                <RiArticleLine size={24} className="mb-2" />
                <p className="text-sm">{error || 'No posts found'}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full p-6">
            <h3 className="font-bold text-lg text-white mb-3">{title}</h3>
            <div className="space-y-2 flex-1 overflow-y-auto">
                {posts.map((post, index) => (
                    <a
                        key={index}
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block py-3 rounded-lg hover:bg-white/10 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="font-medium text-white text-sm line-clamp-2">
                            {post.title}
                        </p>
                    </a>
                ))}
            </div>
        </div>
    );
}
