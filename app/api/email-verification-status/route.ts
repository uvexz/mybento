import { NextResponse } from 'next/server';

export async function GET() {
    // Check if email service is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM;
    
    const enabled = !!(resendApiKey && emailFrom);
    
    return NextResponse.json({ enabled });
}
