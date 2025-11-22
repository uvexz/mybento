import { NextResponse } from 'next/server';
import { isRegistrationOpen } from '@/lib/data';

export async function GET() {
    try {
        const isOpen = await isRegistrationOpen();
        return NextResponse.json({ isOpen });
    } catch (error) {
        console.error('Check registration status error:', error);
        return NextResponse.json({ isOpen: false }, { status: 500 });
    }
}
