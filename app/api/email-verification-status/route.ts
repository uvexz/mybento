import { NextResponse } from 'next/server';
import { isEmailConfigured } from '@/lib/email';

export async function GET() {
    return NextResponse.json({
        enabled: isEmailConfigured(),
    });
}
