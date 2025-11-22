'use client';

import { useEffect, useState } from 'react';
import { RiLineChartLine, RiEyeLine } from '@remixicon/react';
import { useTranslations } from 'next-intl';

interface CardStat {
    id: string;
    title: string;
    clicks: number;
}

interface StatsPanelProps {
    userId: string;
}

export default function StatsPanel({ userId }: StatsPanelProps) {
    const t = useTranslations();
    const [stats, setStats] = useState<CardStat[]>([]);
    const [totalClicks, setTotalClicks] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/stats?userId=${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    console.error('[StatsPanel] Error from API:', data.error);
                }
                if (data.stats) {
                    setStats(data.stats);
                    setTotalClicks(data.totalClicks);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to load stats:', err);
                setIsLoading(false);
            });
    }, [userId]);

    if (isLoading) {
        return (
            <div>
                <p className="text-gray-500 dark:text-gray-400">{t('stats.loadingStats')}</p>
            </div>
        );
    }

    return (
        <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <RiEyeLine className="w-8 h-8 text-blue-600" />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('stats.totalClicks')}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalClicks}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <RiLineChartLine className="w-8 h-8 text-green-600" />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('stats.activeCards')}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.length}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">{t('stats.cardPerformance')}</h4>
                    {stats.length === 0 ? (
                        <p className="text-gray-500 text-sm">{t('stats.noCards')}</p>
                    ) : (
                        stats
                            .sort((a, b) => b.clicks - a.clicks)
                            .map(card => (
                                <div key={card.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex flex-col flex-1 min-w-0 mr-2">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {card.title || t('common.untitled')}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                                            {card.id}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
                                        {card.clicks} {t('common.clicks')}
                                    </span>
                                </div>
                            ))
                    )}
                </div>
        </div>
    );
}
