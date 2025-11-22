import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { db } from './db';
import { siteSettings } from './schema';

// Get R2 configuration from database or environment variables
async function getR2Config() {
    try {
        const settings = await db.select().from(siteSettings);
        const settingsMap: Record<string, string> = {};
        
        settings.forEach(setting => {
            settingsMap[setting.key] = setting.value || '';
        });

        return {
            endpoint: settingsMap.r2_endpoint || process.env.R2_ENDPOINT || '',
            accessKeyId: settingsMap.r2_access_key_id || process.env.R2_ACCESS_KEY_ID || '',
            secretAccessKey: settingsMap.r2_secret_access_key || process.env.R2_SECRET_ACCESS_KEY || '',
            bucketName: settingsMap.r2_bucket_name || process.env.R2_BUCKET_NAME || '',
            publicUrl: settingsMap.r2_public_url || process.env.R2_PUBLIC_URL || '',
            maxUploadSize: parseInt(settingsMap.max_upload_size || '5'),
        };
    } catch (error) {
        // Fallback to environment variables if database is not available
        return {
            endpoint: process.env.R2_ENDPOINT || '',
            accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
            bucketName: process.env.R2_BUCKET_NAME || '',
            publicUrl: process.env.R2_PUBLIC_URL || '',
            maxUploadSize: 5,
        };
    }
}

export async function uploadImage(
    file: File,
    folder: 'avatars' | 'cards' | 'backgrounds',
    username?: string
): Promise<string> {
    const config = await getR2Config();

    // Check if R2 is configured
    if (!config.endpoint || !config.accessKeyId || !config.secretAccessKey || !config.bucketName) {
        throw new Error('R2 storage is not configured. Please configure it in the admin panel.');
    }

    // Create S3 client with configuration
    // For Cloudflare R2, endpoint should be: https://<account-id>.r2.cloudflarestorage.com
    // Using forcePathStyle: true to use path-style URLs (endpoint/bucket/key)
    const s3Client = new S3Client({
        region: 'auto',
        endpoint: config.endpoint, // Use endpoint directly (e.g., https://account-id.r2.cloudflarestorage.com)
        credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
        },
        forcePathStyle: true, // Use path-style URLs: endpoint/bucket/key instead of bucket.endpoint/key
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generate filename: username/timestamp/random.ext
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop() || 'jpg';
    
    let filename: string;
    if (username) {
        filename = `${username}/${timestamp}/${randomStr}.${ext}`;
    } else {
        // Fallback to old format if username not provided
        filename = `${folder}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    }

    const command = new PutObjectCommand({
        Bucket: config.bucketName,
        Key: filename,
        Body: buffer,
        ContentType: file.type,
    });

    try {
        await s3Client.send(command);
    } catch (error: any) {
        console.error('S3 upload error:', error);
        throw new Error(`Failed to upload to R2: ${error.message}`);
    }

    // Return public URL
    // If publicUrl is set, use it; otherwise construct from endpoint
    let publicUrl: string;
    if (config.publicUrl) {
        publicUrl = `${config.publicUrl}/${filename}`;
    } else {
        // Fallback: construct path-style URL from endpoint and bucket
        const endpointUrl = config.endpoint.replace(/\/$/, ''); // Remove trailing slash
        publicUrl = `${endpointUrl}/${config.bucketName}/${filename}`;
    }
    
    return publicUrl;
}

export async function validateImageFile(file: File): Promise<{ valid: boolean; error?: string }> {
    const config = await getR2Config();
    const maxSize = config.maxUploadSize * 1024 * 1024; // Convert MB to bytes
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' };
    }

    if (file.size > maxSize) {
        return { valid: false, error: `File too large. Maximum size is ${config.maxUploadSize}MB.` };
    }

    return { valid: true };
}

// Check if R2 is configured
export async function isR2Configured(): Promise<boolean> {
    const config = await getR2Config();
    return !!(config.endpoint && config.accessKeyId && config.secretAccessKey && config.bucketName);
}
