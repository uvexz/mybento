import { NextResponse } from 'next/server';
import { getAdminStats, isAdmin } from '@/lib/admin';

export async function GET() {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const stats = await getAdminStats();
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Get admin stats error:', error);
        return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
    }
}
