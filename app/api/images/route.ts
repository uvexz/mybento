import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { userImages } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { uploadImage } from '@/lib/upload';
import { canUserPerformAction } from '@/lib/admin';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { handleApiError, createErrorResponse, COMMON_ERRORS } from '@/lib/error-handler';

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
        const apiError = handleApiError(error, 'Get images');
        return NextResponse.json(
            createErrorResponse(apiError),
            { status: apiError.statusCode }
        );
    }
}

// Upload new image
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json(
                createErrorResponse(COMMON_ERRORS.UNAUTHORIZED),
                { status: 401 }
            );
        }

        // 速率限制检查
        const rateLimit = checkRateLimit(`upload:${session.user.id}`, RATE_LIMITS.MODERATE);

        if (!rateLimit.success) {
            return NextResponse.json(
                createErrorResponse(COMMON_ERRORS.RATE_LIMIT_EXCEEDED),
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': rateLimit.limit.toString(),
                        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                        'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
                    },
                }
            );
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
        const apiError = handleApiError(error, 'Upload image');
        return NextResponse.json(
            createErrorResponse(apiError),
            { status: apiError.statusCode }
        );
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
        const apiError = handleApiError(error, 'Delete image');
        return NextResponse.json(
            createErrorResponse(apiError),
            { status: apiError.statusCode }
        );
    }
}
