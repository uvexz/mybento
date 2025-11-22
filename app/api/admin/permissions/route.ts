import { NextRequest, NextResponse } from 'next/server';
import { getDefaultUserPermissions, updateDefaultUserPermissions, isAdmin } from '@/lib/admin';

export async function GET() {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const permissions = await getDefaultUserPermissions();
        return NextResponse.json(permissions);
    } catch (error) {
        console.error('Get permissions error:', error);
        return NextResponse.json({ error: 'Failed to get permissions' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        await updateDefaultUserPermissions(body);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update permissions error:', error);
        return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 });
    }
}
