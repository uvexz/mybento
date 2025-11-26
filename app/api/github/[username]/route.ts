import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache
const cache = new Map<string, { data: Record<string, unknown>; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    const { username } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'user';
    const repo = searchParams.get('repo');

    const cacheKey = type === 'repo' && repo ? `${username}/${repo}` : username;

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return NextResponse.json(cached.data);
    }

    try {
        let url: string;
        if (type === 'repo' && repo) {
            url = `https://api.github.com/repos/${username}/${repo}`;
        } else {
            url = `https://api.github.com/users/${username}`;
        }

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                ...(process.env.GITHUB_TOKEN && {
                    'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
                })
            },
            next: { revalidate: 300 } // 5 minutes
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();

        // Transform data
        let result;
        if (type === 'repo') {
            result = {
                type: 'repo',
                name: data.name,
                description: data.description,
                stars: data.stargazers_count,
                forks: data.forks_count,
                language: data.language,
                owner: {
                    login: data.owner.login,
                    avatar: data.owner.avatar_url,
                },
                url: data.html_url,
            };
        } else {
            result = {
                type: 'user',
                login: data.login,
                name: data.name,
                bio: data.bio,
                avatar: data.avatar_url,
                followers: data.followers,
                publicRepos: data.public_repos,
                url: data.html_url,
            };
        }

        // Update cache
        cache.set(cacheKey, { data: result, timestamp: Date.now() });

        return NextResponse.json(result);
    } catch (error) {
        console.error('GitHub API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch GitHub data' },
            { status: 500 }
        );
    }
}
