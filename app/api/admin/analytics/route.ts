import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cards, cardClicks, user } from '@/lib/schema';
import { eq, sql, desc, gte, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const userResult = await db.select().from(user).where(eq(user.email, session.user.email)).limit(1);
        const userData = userResult[0];

        if (!userData || userData.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get time range from query params
        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '7d';

        // Calculate date threshold
        let dateThreshold: Date | null = null;
        if (range === '7d') {
            dateThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        } else if (range === '30d') {
            dateThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        }

        // Get all cards with their click counts
        const allCards = await db.select({
            id: cards.id,
            title: cards.title,
            type: cards.type,
            clicks: cards.clicks,
        }).from(cards);

        // Get top cards
        const topCards = allCards
            .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
            .slice(0, 10)
            .map(card => ({
                id: card.id,
                title: card.title,
                clicks: card.clicks || 0,
                type: card.type,
            }));

        // Get clicks by card type
        const clicksByTypeMap = new Map<string, number>();
        allCards.forEach(card => {
            const currentClicks = clicksByTypeMap.get(card.type) || 0;
            clicksByTypeMap.set(card.type, currentClicks + (card.clicks || 0));
        });

        const clicksByType = Array.from(clicksByTypeMap.entries())
            .map(([type, clicks]) => ({ type, clicks }))
            .sort((a, b) => b.clicks - a.clicks);

        // Get time series data
        let timeSeriesData: { date: string; clicks: number }[] = [];
        
        if (dateThreshold) {
            // Query card clicks within the time range
            const clicksInRange = await db
                .select({
                    date: sql<string>`DATE(${cardClicks.clickedAt})`,
                    clicks: sql<number>`COUNT(*)::int`,
                })
                .from(cardClicks)
                .where(gte(cardClicks.clickedAt, dateThreshold))
                .groupBy(sql`DATE(${cardClicks.clickedAt})`)
                .orderBy(sql`DATE(${cardClicks.clickedAt})`);

            timeSeriesData = clicksInRange.map(row => ({
                date: new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                clicks: row.clicks,
            }));
        }

        // Calculate summary stats
        const totalClicks = allCards.reduce((sum, card) => sum + (card.clicks || 0), 0);
        const avgClicksPerCard = allCards.length > 0 ? totalClicks / allCards.length : 0;

        return NextResponse.json({
            topCards,
            clicksByType,
            timeSeriesData,
            totalClicks,
            avgClicksPerCard,
        });
    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
