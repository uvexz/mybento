import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadImage, validateImageFile } from '@/lib/upload';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
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
        const validation = validateImageFile(file);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        // Check if R2 is configured
        if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID) {
            return NextResponse.json({ 
                error: 'Image upload not configured. Please set R2 environment variables.' 
            }, { status: 503 });
        }

        // Upload to R2
        const url = await uploadImage(file, folder);

        return NextResponse.json({ url });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
}
