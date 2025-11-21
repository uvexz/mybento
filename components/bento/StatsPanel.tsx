'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CardStat {
    id: string;
    title: string;
    clicks: number;
}

interface StatsPanelProps {
    userId: string;
}

export default function StatsPanel({ userId }: StatsPanelProps) {
    const [stats, setStats] = useState<CardStat[]>([]);
    const [totalClicks, setTotalClicks] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/stats?userId=${userId}`)
            .then(res => res.json())
            .then(data => {
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
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Analytics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-500">Loading stats...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Analytics
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Eye className="w-8 h-8 text-blue-600" />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalClicks}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <TrendingUp className="w-8 h-8 text-green-600" />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Active Cards</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.length}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">Card Performance</h4>
                    {stats.length === 0 ? (
                        <p className="text-gray-500 text-sm">No cards yet</p>
                    ) : (
                        stats
                            .sort((a, b) => b.clicks - a.clicks)
                            .map(card => (
                                <div key={card.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
                                        {card.title}
                                    </span>
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400 ml-2">
                                        {card.clicks} clicks
                                    </span>
                                </div>
                            ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
