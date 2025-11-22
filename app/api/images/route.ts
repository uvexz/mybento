import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { userImages } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { uploadImage } from '@/lib/upload';
import { canUserPerformAction } from '@/lib/admin';

// Get user's images
export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const images = await db.select()
            .from(userImages)
            .where(eq(userImages.userId, session.user.id))
            .orderBy(desc(userImages.createdAt));

        return NextResponse.json({ images });
    } catch (error) {
        console.error('Get images error:', error);
        return NextResponse.json({ error: 'Failed to get images' }, { status: 500 });
    }
}

// Upload new image
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user can upload
        const canUpload = await canUserPerformAction(session.user.id, 'upload');
        if (!canUpload.allowed) {
            return NextResponse.json({ error: canUpload.reason }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file
        const { validateImageFile } = await import('@/lib/upload');
        const validation = await validateImageFile(file);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        // Get username from session
        const username = (session.user as any).username || session.user.email?.split('@')[0] || 'user';

        // Upload to R2
        const url = await uploadImage(file, 'cards', username);

        // Save to database
        const [image] = await db.insert(userImages).values({
            userId: session.user.id,
            url,
            filename: file.name,
            size: file.size,
            type: file.type,
        }).returning();

        return NextResponse.json({ image });
    } catch (error: any) {
        console.error('Upload image error:', error);
        const errorMessage = error.message || 'Failed to upload image';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// Delete image
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const imageId = searchParams.get('id');

        if (!imageId) {
            return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
        }

        // Check ownership
        const [image] = await db.select()
            .from(userImages)
            .where(eq(userImages.id, parseInt(imageId)))
            .limit(1);

        if (!image || image.userId !== session.user.id) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        // Delete from database
        await db.delete(userImages).where(eq(userImages.id, parseInt(imageId)));

        // Note: We don't delete from R2 as the image might be used elsewhere
        // In production, you might want to implement a cleanup job

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete image error:', error);
        return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
    }
}
