import { NextRequest, NextResponse } from 'next/server';
import { auth, type ExtendedSession } from '@/lib/auth';
import { uploadImage, validateImageFile, isR2Configured } from '@/lib/upload';

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        }) as ExtendedSession | null;
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = (formData.get('folder') as 'avatars' | 'cards' | 'backgrounds') || 'cards';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file
        const validation = await validateImageFile(file);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        // Check if R2 is configured
        const configured = await isR2Configured();
        if (!configured) {
            return NextResponse.json({ 
                error: 'Image upload not configured. Please configure R2 in the admin panel.' 
            }, { status: 503 });
        }

        // Get username from session
        const extUser = session.user as { username?: string; email?: string };
        const username = extUser.username || extUser.email?.split('@')[0] || 'user';

        // Upload to R2
        const url = await uploadImage(file, folder, username);

        return NextResponse.json({ url });
    } catch (error) {
        console.error('Upload error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
