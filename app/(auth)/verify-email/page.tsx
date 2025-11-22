'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const token = searchParams.get('token');
        const callbackURL = searchParams.get('callbackURL') || '/';

        if (!token) {
            setStatus('error');
            setError('Verification token is missing');
            return;
        }

        // 调用 Better Auth 的验证端点
        fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        })
            .then(async (res) => {
                if (res.ok) {
                    setStatus('success');
                    // 验证成功后，等待 2 秒然后重定向
                    setTimeout(() => {
                        window.location.href = callbackURL;
                    }, 2000);
                } else {
                    const data = await res.json();
                    setStatus('error');
                    setError(data.error || 'Verification failed');
                }
            })
            .catch((err) => {
                setStatus('error');
                setError('An unexpected error occurred');
            });
    }, [searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">
                        {status === 'verifying' && 'Verifying Email...'}
                        {status === 'success' && 'Email Verified! ✓'}
                        {status === 'error' && 'Verification Failed'}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {status === 'verifying' && 'Please wait while we verify your email address'}
                        {status === 'success' && 'Your email has been successfully verified'}
                        {status === 'error' && 'There was a problem verifying your email'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status === 'verifying' && (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="text-center space-y-4">
                            <div className="text-6xl">✓</div>
                            <p className="text-sm text-gray-600">
                                Redirecting you to your dashboard...
                            </p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button asChild className="w-full">
                                    <Link href="/login">Go to Login</Link>
                                </Button>
                                <Button variant="outline" asChild className="w-full">
                                    <Link href="/">Back to Home</Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Verifying Email...</CardTitle>
                        <CardDescription className="text-center">
                            Please wait while we verify your email address
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
