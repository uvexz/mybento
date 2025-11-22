import { NextRequest, NextResponse } from 'next/server';
import { getSiteSettings, updateSiteSettings, isAdmin } from '@/lib/admin';

export async function GET() {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const settings = await getSiteSettings();
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Get settings error:', error);
        return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        await updateSiteSettings(body);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update settings error:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
