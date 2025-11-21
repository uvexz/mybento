import { NextRequest, NextResponse } from 'next/server';
import { trackCardClick } from '@/lib/actions';

export async function POST(request: NextRequest) {
    try {
        const { cardId } = await request.json();
        
        if (!cardId) {
            return NextResponse.json({ error: 'Card ID required' }, { status: 400 });
        }

        const userAgent = request.headers.get('user-agent') || undefined;
        const referer = request.headers.get('referer') || undefined;

        await trackCardClick(cardId, userAgent, referer);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Track click API error:', error);
        return NextResponse.json({ error: 'Failed to track click' }, { status: 500 });
    }
}
