import { auth, type ExtendedSession } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';

export async function GET() {
    // Only allow in development or for admins
    if (process.env.NODE_ENV === 'production') {
        try {
            const admin = await isAdmin();
            if (!admin) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        } catch {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
    }

    try {
        const session = await auth.api.getSession({
            headers: await headers()
        }) as ExtendedSession | null;
        
        return NextResponse.json({
            hasSession: !!session,
            user: session?.user || null,
            session: session || null,
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            hasSession: false,
        });
    }
}
