import { NextRequest, NextResponse } from 'next/server';
import { getCardStats } from '@/lib/actions';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const result = await getCardStats(userId);

        if ('error' in result) {
            return NextResponse.json({ error: result.error }, { status: 403 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Stats API error:', error);
        return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
    }
}
