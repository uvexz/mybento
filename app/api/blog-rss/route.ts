import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const rssUrl = searchParams.get('url');

        if (!rssUrl) {
            return NextResponse.json({ error: 'RSS URL is required' }, { status: 400 });
        }

        // Try multiple CORS proxy options
        const proxyOptions = [
            // Option 3: Direct fetch (might work for some RSS feeds)
            rssUrl,
            // Option 2: allorigins.win
            `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`,
            // Option 3: corsproxy.io
            `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`,
        ];

        let xmlText = '';
        let lastError = null;

        for (const proxyUrl of proxyOptions) {
            try {
                const response = await fetch(proxyUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; mybento-app)',
                        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
                    },
                    signal: AbortSignal.timeout(5000), // 5 second timeout
                });

                if (response.ok) {
                    xmlText = await response.text();
                    
                    // Verify it's valid XML/RSS
                    if (xmlText.includes('<rss') || xmlText.includes('<feed')) {
                        break;
                    }
                }
            } catch (err) {
                lastError = err;
                continue; // Try next proxy
            }
        }

        if (!xmlText) {
            throw lastError || new Error('Failed to fetch RSS feed from all proxies');
        }

        return new NextResponse(xmlText, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
        });
    } catch (error) {
        console.error('Blog RSS fetch error:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch RSS feed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
