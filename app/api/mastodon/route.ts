import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const input = searchParams.get('input');

    if (!input) {
        return NextResponse.json({ error: 'Input is required' }, { status: 400 });
    }

    try {
        // Parse different input formats
        const rssUrl = parseMastodonInput(input);
        
        if (!rssUrl) {
            return NextResponse.json({ 
                error: 'Invalid Mastodon input format',
                details: 'Please use format: @username@instance.com or https://instance.com/@username'
            }, { status: 400 });
        }

        // Validate URL
        try {
            new URL(rssUrl);
        } catch {
            return NextResponse.json({ 
                error: 'Invalid URL generated',
                details: `Generated URL: ${rssUrl}`
            }, { status: 400 });
        }

        // Fetch RSS feed with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(rssUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; MyBento/1.0)',
            },
            signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));

        if (!response.ok) {
            return NextResponse.json({ 
                error: 'Failed to fetch Mastodon RSS feed',
                details: `HTTP ${response.status}`
            }, { status: response.status });
        }

        const xmlText = await response.text();
        
        // Parse RSS feed using regex (simple server-side parsing)
        const channelMatch = xmlText.match(/<channel>([\s\S]*?)<\/channel>/);
        if (!channelMatch) {
            return NextResponse.json({ error: 'Invalid RSS structure' }, { status: 400 });
        }

        const channelContent = channelMatch[1];

        // Extract channel info
        const title = extractTag(channelContent, 'title') || '';
        const description = extractTag(channelContent, 'description') || '';
        const link = extractTag(channelContent, 'link') || '';
        
        // Extract avatar from image or webfeeds:icon
        const imageUrlMatch = channelContent.match(/<image>[\s\S]*?<url>(.*?)<\/url>[\s\S]*?<\/image>/);
        const webfeedsIconMatch = channelContent.match(/<webfeeds:icon>(.*?)<\/webfeeds:icon>/);
        const avatarUrl = imageUrlMatch?.[1] || webfeedsIconMatch?.[1] || '';

        // Get the first item (latest post)
        const itemMatch = xmlText.match(/<item>([\s\S]*?)<\/item>/);
        let latestPost = null;

        if (itemMatch) {
            const itemContent = itemMatch[1];
            const postDescription = extractTag(itemContent, 'description') || '';
            const postLink = extractTag(itemContent, 'link') || '';
            const pubDate = extractTag(itemContent, 'pubDate') || '';
            
            // Extract media if available
            const mediaMatch = itemContent.match(/<media:content[^>]*url="([^"]*)"[^>]*type="([^"]*)"/);
            const mediaUrl = mediaMatch?.[1] || '';
            const mediaType = mediaMatch?.[2] || '';

            // Decode HTML entities and strip HTML tags from description
            let plainText = postDescription
                // First decode HTML entities
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&nbsp;/g, ' ')
                // Then strip HTML tags
                .replace(/<[^>]*>/g, '')
                .trim();

            latestPost = {
                content: plainText,
                link: postLink,
                pubDate: pubDate,
                mediaUrl: mediaUrl,
                mediaType: mediaType,
            };
        }

        return NextResponse.json({
            name: title,
            description: description,
            profileUrl: link,
            avatarUrl: avatarUrl,
            rssUrl: rssUrl,
            latestPost: latestPost,
        });

    } catch (error) {
        console.error('Mastodon API error:', error);
        
        // Handle specific error types
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                return NextResponse.json({ 
                    error: 'Request timeout',
                    details: 'The Mastodon server took too long to respond'
                }, { status: 504 });
            }
            
            if (error.message.includes('ECONNRESET') || error.message.includes('fetch failed')) {
                return NextResponse.json({ 
                    error: 'Connection failed',
                    details: 'Could not connect to the Mastodon server. Please check the username and instance.'
                }, { status: 503 });
            }
        }
        
        return NextResponse.json({ 
            error: 'Failed to fetch Mastodon data',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// Helper function to extract content from XML tags
function extractTag(xml: string, tagName: string): string | null {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : null;
}

// Parse different Mastodon input formats
function parseMastodonInput(input: string): string | null {
    input = input.trim();

    // Reject if input is too short or doesn't contain necessary parts
    if (input.length < 3) {
        return null;
    }

    // Format 1: @username@instance.com or username@instance.com
    const atMatch = input.match(/^@?([^@\s]+)@([^@\s]+\.[^@\s]+)$/);
    if (atMatch) {
        const [, username, instance] = atMatch;
        // Validate instance has a TLD
        if (!instance.includes('.')) {
            return null;
        }
        return `https://${instance}/@${username}.rss`;
    }

    // Format 2: https://instance.com/@username
    const urlMatch1 = input.match(/^https?:\/\/([^\/\s]+)\/@([^\/\?#\s]+)/);
    if (urlMatch1) {
        const [, instance, username] = urlMatch1;
        return `https://${instance}/@${username}.rss`;
    }

    // Format 3: https://instance.com/users/username
    const urlMatch2 = input.match(/^https?:\/\/([^\/\s]+)\/users\/([^\/\?#\s]+)/);
    if (urlMatch2) {
        const [, instance, username] = urlMatch2;
        return `https://${instance}/@${username}.rss`;
    }

    // Format 4: Direct RSS URL
    if (input.endsWith('.rss') && input.startsWith('http')) {
        return input;
    }

    return null;
}
