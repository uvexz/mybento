import { auth, type ExtendedSession } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
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
