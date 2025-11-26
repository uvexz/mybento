'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
    RiBarChartBoxLine,
    RiLineChartLine,
    RiPieChartLine,
    RiTrophyLine,
} from '@remixicon/react';
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface CardAnalytics {
    id: string;
    title: string;
    clicks: number;
    type: string;
}

interface TimeSeriesData {
    date: string;
    clicks: number;
}

interface AnalyticsData {
    topCards: CardAnalytics[];
    clicksByType: { type: string; clicks: number }[];
    timeSeriesData: TimeSeriesData[];
    totalClicks: number;
    avgClicksPerCard: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsDashboard() {
    const t = useTranslations();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/analytics?range=${timeRange}`);
            if (res.ok) {
                const analyticsData = await res.json();
                setData(analyticsData);
            }
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">{t('common.loading')}</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">No analytics data available</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <RiBarChartBoxLine size={20} />
                    Analytics Dashboard
                </h3>
                <div className="flex gap-2">
                    {(['7d', '30d', 'all'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                timeRange === range
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'All Time'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 rounded-xl border border-blue-200/50">
                    <div className="text-sm font-medium text-blue-600 mb-1">Total Clicks</div>
                    <div className="text-3xl font-bold text-blue-700">{data.totalClicks.toLocaleString()}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-5 rounded-xl border border-green-200/50">
                    <div className="text-sm font-medium text-green-600 mb-1">Avg Clicks per Card</div>
                    <div className="text-3xl font-bold text-green-700">{data.avgClicksPerCard.toFixed(1)}</div>
                </div>
            </div>

            {/* Clicks Over Time */}
            {data.timeSeriesData.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h4 className="text-base font-semibold mb-4 flex items-center gap-2">
                        <RiLineChartLine size={18} />
                        Clicks Over Time
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.timeSeriesData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="clicks"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="grid grid-cols-2 gap-6">
                {/* Top Cards */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h4 className="text-base font-semibold mb-4 flex items-center gap-2">
                        <RiTrophyLine size={18} />
                        Top Performing Cards
                    </h4>
                    <div className="space-y-3">
                        {data.topCards.slice(0, 5).map((card, index) => (
                            <div
                                key={card.id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <div
                                    className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                                        index === 0
                                            ? 'bg-yellow-400 text-yellow-900'
                                            : index === 1
                                            ? 'bg-gray-300 text-gray-700'
                                            : index === 2
                                            ? 'bg-orange-300 text-orange-900'
                                            : 'bg-gray-200 text-gray-600'
                                    }`}
                                >
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">{card.title}</div>
                                    <div className="text-xs text-gray-500">{card.type}</div>
                                </div>
                                <div className="text-lg font-bold text-blue-600">{card.clicks}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Clicks by Card Type */}
                {data.clicksByType.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h4 className="text-base font-semibold mb-4 flex items-center gap-2">
                            <RiPieChartLine size={18} />
                            Clicks by Card Type
                        </h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={data.clicksByType}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry: any) => {
                                        const percent = entry.percent || 0;
                                        return `${entry.type || ''} (${(percent * 100).toFixed(0)}%)`;
                                    }}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="clicks"
                                >
                                    {data.clicksByType.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
