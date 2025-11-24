'use client';

import React, { useState } from 'react';
import { RiGroupLine, RiArchiveLine, RiStarLine, RiGitForkLine, RiGithubFill, RiRefreshLine } from '@remixicon/react';
import { GitHubData } from '@/lib/types';

interface GithubCardProps {
    data: GitHubData;
}

export default function GithubCard({ data: initialData }: GithubCardProps) {
    const [data, setData] = useState(initialData);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const isUser = data.type === 'user';

    const handleRefresh = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsRefreshing(true);

        try {
            const username = isUser ? data.login : data.owner.login;
            const url = isUser
                ? `/api/github/${username}?type=user`
                : `/api/github/${data.owner.login}?type=repo&repo=${data.name}`;

            const response = await fetch(url);
            if (response.ok) {
                const freshData = await response.json();
                setData(freshData);
            }
        } catch (error) {
            console.error('Failed to refresh GitHub data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="flex flex-col h-full group/github">
            {/* Header */}
            <div className="flex items-start gap-3 mb-auto">
                <div className="relative flex-shrink-0">
                    <img
                        src={isUser ? data.avatar : data.owner.avatar}
                        alt={isUser ? (data.name || data.login) : data.owner.login}
                        loading="lazy"
                        className="w-12 h-12 rounded-full border border-[var(--glass-border)] group-hover/github:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-black text-white rounded-full p-0.5 border border-[var(--glass-border)]">
                        <RiGithubFill size={14} />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate tracking-tight group-hover/github:text-blue-600 dark:group-hover/github:text-blue-400 transition-colors">
                        {isUser ? (data.name || data.login) : data.name}
                    </h3>
                    <p className="text-sm opacity-70 truncate">
                        {isUser ? `@${data.login}` : data.owner.login}
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-1.5 rounded-lg hover:bg-black/10 transition-colors opacity-0 group-hover/github:opacity-100"
                    title="Refresh data"
                >
                    <RiRefreshLine
                        size={16}
                        className={isRefreshing ? 'animate-spin' : ''}
                    />
                </button>
            </div>

            {/* Description / Bio */}
            {(isUser ? data.bio : data.description) && (
                <p className="text-sm opacity-90 mb-4 line-clamp-2 leading-relaxed">
                    {isUser ? data.bio : data.description}
                </p>
            )}

            {/* Stats Footer */}
            <div className="flex gap-4 text-xs opacity-80 mt-auto pt-4 border-t border-[var(--glass-border)]">
                {isUser ? (
                    <>
                        <span className="flex items-center gap-1.5 hover:opacity-100 transition-opacity">
                            <RiGroupLine size={14} />
                            <span className="font-medium">{data.followers}</span> followers
                        </span>
                        <span className="flex items-center gap-1.5 hover:opacity-100 transition-opacity">
                            <RiArchiveLine size={14} />
                            <span className="font-medium">{data.publicRepos}</span> repos
                        </span>
                    </>
                ) : (
                    <>
                        <span className="flex items-center gap-1.5 hover:opacity-100 transition-opacity">
                            <RiStarLine size={14} />
                            <span className="font-medium">{data.stars}</span>
                        </span>
                        <span className="flex items-center gap-1.5 hover:opacity-100 transition-opacity">
                            <RiGitForkLine size={14} />
                            <span className="font-medium">{data.forks}</span>
                        </span>
                        {data.language && (
                            <span className="flex items-center gap-1.5 ml-auto hover:opacity-100 transition-opacity">
                                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                                {data.language}
                            </span>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
