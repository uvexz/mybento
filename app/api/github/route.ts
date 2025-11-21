import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const path = searchParams.get('path'); // username or username/repo

        if (!path) {
            return NextResponse.json({ error: 'Path is required' }, { status: 400 });
        }

        const isRepo = path.includes('/');
        const apiUrl = isRepo
            ? `https://api.github.com/repos/${path}`
            : `https://api.github.com/users/${path}`;

        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'mybento-app',
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json({ error: 'User or repository not found' }, { status: 404 });
            }
            throw new Error('GitHub API request failed');
        }

        const data = await response.json();

        if (isRepo) {
            // Repository data
            return NextResponse.json({
                type: 'repo',
                name: data.name,
                fullName: data.full_name,
                description: data.description,
                stars: data.stargazers_count,
                forks: data.forks_count,
                language: data.language,
                url: data.html_url,
                owner: {
                    login: data.owner.login,
                    avatar: data.owner.avatar_url,
                },
            });
        } else {
            // User data
            return NextResponse.json({
                type: 'user',
                login: data.login,
                name: data.name,
                bio: data.bio,
                avatar: data.avatar_url,
                followers: data.followers,
                following: data.following,
                publicRepos: data.public_repos,
                url: data.html_url,
            });
        }
    } catch (error) {
        console.error('GitHub API error:', error);
        return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 });
    }
}
