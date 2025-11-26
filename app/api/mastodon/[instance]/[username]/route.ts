import { NextRequest, NextResponse } from 'next/server';
import { parseStringPromise } from 'xml2js';

// Simple in-memory cache
const cache = new Map<string, { data: Record<string, unknown>; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ instance: string; username: string }> }
) {
    const { instance, username } = await params;
    const cacheKey = `${instance}/${username}`;

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return NextResponse.json(cached.data);
    }

    try {
        // Fetch RSS feed
        const rssUrl = `https://${instance}/@${username}.rss`;
        const response = await fetch(rssUrl, {
            next: { revalidate: 300 } // 5 minutes
        });

        if (!response.ok) {
            throw new Error(`Mastodon RSS error: ${response.status}`);
        }

        const xmlText = await response.text();
        const parsed = await parseStringPromise(xmlText);

        const channel = parsed.rss?.channel?.[0];
        if (!channel) {
            throw new Error('Invalid RSS feed');
        }

        // Extract profile info
        const name = channel.title?.[0] || username;
        const description = channel.description?.[0] || '';
        const profileUrl = channel.link?.[0] || `https://${instance}/@${username}`;

        // Extract avatar from image
        const avatarUrl = channel.image?.[0]?.url?.[0] || '';

        // Extract latest post
        let latestPost = null;
        if (channel.item && channel.item.length > 0) {
            const item = channel.item[0];
            
            // Clean HTML content
            const content = item.description?.[0]
                ?.replace(/<[^>]*>/g, '')
                ?.replace(/&[^;]+;/g, ' ')
                ?.trim() || '';

            // Extract media if available
            const mediaUrl = item['media:content']?.[0]?.$?.url || null;
            const mediaType = item['media:content']?.[0]?.$?.type || null;

            latestPost = {
                title: item.title?.[0] || '',
                content,
                pubDate: item.pubDate?.[0] || '',
                link: item.link?.[0] || '',
                mediaUrl,
                mediaType,
            };
        }

        const result = {
            name,
            description,
            profileUrl,
            avatarUrl,
            latestPost,
        };

        // Update cache
        cache.set(cacheKey, { data: result, timestamp: Date.now() });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Mastodon API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch Mastodon data' },
            { status: 500 }
        );
    }
}
